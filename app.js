const DATA_URL = 'data/lookup.json';

const state = {
	data: null,
	selectedKeys: [],
	search: '',
	includeWarly: true,
	sort: 'name',
};

const els = {
	status: document.querySelector('#dataset-status'),
	search: document.querySelector('#ingredient-search'),
	includeWarly: document.querySelector('#include-warly'),
	sort: document.querySelector('#recipe-sort'),
	clearSelection: document.querySelector('#clear-selection'),
	ingredientList: document.querySelector('#ingredient-list'),
	ingredientName: document.querySelector('#ingredient-name'),
	ingredientTags: document.querySelector('#ingredient-tags'),
	selectedIngredients: document.querySelector('#selected-ingredients'),
	resultCount: document.querySelector('#result-count'),
	recipeGrid: document.querySelector('#recipe-grid'),
	ingredientTemplate: document.querySelector('#ingredient-template'),
	recipeTemplate: document.querySelector('#recipe-template'),
};

init();

async function init() {
	bindControls();

	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		state.data = prepareData(data);
		state.selectedKeys = [pickDefaultIngredient(state.data.ingredients)];
		render();
	} catch (error) {
		els.status.textContent = '資料載入失敗';
		els.recipeGrid.innerHTML = `<div class="empty-state">Cannot load ${DATA_URL}: ${escapeHtml(error.message)}</div>`;
	}
}

function bindControls() {
	els.search.addEventListener('input', event => {
		state.search = event.target.value.trim().toLowerCase();
		renderIngredientList();
	});

	els.includeWarly.addEventListener('change', event => {
		state.includeWarly = event.target.checked;
		renderAll();
	});

	els.sort.addEventListener('change', event => {
		state.sort = event.target.value;
		renderSelectionResults();
	});

	els.clearSelection.addEventListener('click', () => {
		state.selectedKeys = [];
		renderAll();
	});
}

function prepareData(data) {
	const edgeMap = new Map();
	for (const edge of data.edges) {
		if (!edgeMap.has(edge.ingredientKey)) {
			edgeMap.set(edge.ingredientKey, []);
		}
		edgeMap.get(edge.ingredientKey).push(edge);
	}

	const ingredients = [...data.ingredients].sort((a, b) =>
		displayName(a).localeCompare(displayName(b), 'zh-Hant'),
	);
	const ingredientMap = new Map(ingredients.map(ingredient => [ingredient.key, ingredient]));

	return {
		...data,
		ingredients,
		ingredientMap,
		edgeMap,
	};
}

function pickDefaultIngredient(ingredients) {
	return ingredients.find(ingredient => ingredient.id === 'berries')?.key ?? ingredients[0]?.key ?? '';
}

function render() {
	els.status.textContent = `${state.data.ingredients.length} ingredients · ${Object.keys(state.data.recipes).length} recipes`;
	renderAll();
}

function renderAll() {
	renderIngredientList();
	renderSelectionResults();
}

function renderIngredientList() {
	if (!state.data) {
		return;
	}

	const fragment = document.createDocumentFragment();
	const ingredients = state.data.ingredients.filter(matchesIngredientSearch);
	els.ingredientList.innerHTML = '';

	for (const ingredient of ingredients) {
		const node = els.ingredientTemplate.content.firstElementChild.cloneNode(true);
		const active = state.selectedKeys.includes(ingredient.key);
		node.dataset.key = ingredient.key;
		node.classList.toggle('is-active', active);
		node.setAttribute('aria-selected', String(active));
		node.querySelector('.ingredient-thumb').append(renderImage(ingredient, 'ingredient-thumb-image'));
		node.querySelector('.ingredient-option-name').textContent = displayName(ingredient);
		node.querySelector('.ingredient-option-subtitle').textContent = ingredient.name;
		node.querySelector('.ingredient-option-count').textContent = visibleRecipeCount(ingredient);
		node.addEventListener('click', () => {
			toggleIngredient(ingredient.key);
			renderAll();
		});
		fragment.append(node);
	}

	els.ingredientList.append(fragment);
}

function renderSelectionResults() {
	if (!state.data) {
		return;
	}

	const selectedIngredients = selectedIngredientObjects();
	const resultEdges = sortedEdges(intersectionEdges(selectedIngredients));
	els.ingredientName.textContent = selectedIngredients.length
		? `${selectedIngredients.length} 個食材`
		: '尚未選擇';
	els.ingredientTags.innerHTML = '';
	els.ingredientTags.append(renderSharedTags(selectedIngredients));
	els.selectedIngredients.innerHTML = '';
	els.selectedIngredients.append(renderSelectedChips(selectedIngredients));
	els.resultCount.textContent = `${resultEdges.length} recipes`;
	els.clearSelection.disabled = selectedIngredients.length === 0;
	els.recipeGrid.innerHTML = '';

	if (selectedIngredients.length === 0) {
		els.recipeGrid.innerHTML = '<div class="empty-state">選擇食材後會顯示料理交集</div>';
		return;
	}

	if (resultEdges.length === 0) {
		els.recipeGrid.innerHTML = '<div class="empty-state">這組食材目前沒有共同料理結果</div>';
		return;
	}

	const fragment = document.createDocumentFragment();
	for (const edge of resultEdges) {
		fragment.append(renderRecipeCard(edge, selectedIngredients));
	}
	els.recipeGrid.append(fragment);
}

function matchesIngredientSearch(ingredient) {
	if (!state.search) {
		return true;
	}

	return (
		ingredient.name.toLowerCase().includes(state.search) ||
		ingredient.zhName.toLowerCase().includes(state.search) ||
		ingredient.id.toLowerCase().includes(state.search) ||
		ingredient.key.toLowerCase().includes(state.search)
	);
}

function toggleIngredient(key) {
	if (state.selectedKeys.includes(key)) {
		state.selectedKeys = state.selectedKeys.filter(selectedKey => selectedKey !== key);
		return;
	}

	if (state.selectedKeys.length >= 4) {
		state.selectedKeys = [...state.selectedKeys.slice(1), key];
		return;
	}

	state.selectedKeys = [...state.selectedKeys, key];
}

function selectedIngredientObjects() {
	return state.selectedKeys
		.map(key => state.data.ingredientMap.get(key))
		.filter(Boolean);
}

function visibleRecipeCount(ingredient) {
	return visibleEdgesForIngredient(ingredient).length;
}

function visibleEdgesForIngredient(ingredient) {
	const edges = state.data.edgeMap.get(ingredient.key) ?? [];
	if (state.includeWarly) {
		return edges;
	}

	return edges.filter(edge => !state.data.recipes[edge.recipeId]?.characterRequired);
}

function intersectionEdges(selectedIngredients) {
	if (selectedIngredients.length === 0) {
		return [];
	}

	const edgeGroups = selectedIngredients.map(ingredient => visibleEdgesForIngredient(ingredient));
	const recipeSets = edgeGroups.map(edges => new Set(edges.map(edge => edge.recipeId)));
	const commonRecipeIds = [...recipeSets[0]].filter(recipeId =>
		recipeSets.every(set => set.has(recipeId)),
	);

	return commonRecipeIds.map(recipeId => {
		const relatedEdges = edgeGroups
			.map(edges => edges.find(edge => edge.recipeId === recipeId))
			.filter(Boolean);
		const edge = bestExampleEdge(relatedEdges, selectedIngredients);
		return {
			...edge,
			relatedEdges,
		};
	});
}

function bestExampleEdge(edges, selectedIngredients) {
	let best = edges[0];
	let bestScore = -1;
	const selectedIds = new Set(selectedIngredients.map(ingredient => ingredient.id));
	const selectedKeys = new Set(selectedIngredients.map(ingredient => ingredient.key));

	for (const edge of edges) {
		const comboIds = new Set(edge.exampleCombo.map(item => item.id));
		const comboKeys = new Set(edge.exampleCombo.map(item => item.key));
		const score = [...selectedIds].filter(id => comboIds.has(id)).length +
			[...selectedKeys].filter(key => comboKeys.has(key)).length;

		if (score > bestScore) {
			best = edge;
			bestScore = score;
		}
	}

	return best;
}

function sortedEdges(edges) {
	return [...edges].sort((a, b) => {
		const recipeA = state.data.recipes[a.recipeId];
		const recipeB = state.data.recipes[b.recipeId];

		if (state.sort === 'priority') {
			return recipeB.priority - recipeA.priority || displayName(recipeA).localeCompare(displayName(recipeB), 'zh-Hant');
		}

		if (state.sort === 'hunger') {
			return Number(recipeB.hunger || 0) - Number(recipeA.hunger || 0) || displayName(recipeA).localeCompare(displayName(recipeB), 'zh-Hant');
		}

		return (
			Number(Boolean(recipeA.characterRequired)) - Number(Boolean(recipeB.characterRequired)) ||
			displayName(recipeA).localeCompare(displayName(recipeB), 'zh-Hant')
		);
	});
}

function renderRecipeCard(edge, selectedIngredients) {
	const recipe = state.data.recipes[edge.recipeId];
	const node = els.recipeTemplate.content.firstElementChild.cloneNode(true);
	const badge = node.querySelector('.badge');
	const combo = edge.exampleCombo;
	const selectedIds = new Set(selectedIngredients.map(ingredient => ingredient.id));
	const selectedKeys = new Set(selectedIngredients.map(ingredient => ingredient.key));

	node.querySelector('.recipe-art').append(renderImage(recipe, 'recipe-image'));
	node.querySelector('h2').textContent = displayName(recipe);
	node.querySelector('.recipe-subtitle').textContent = recipe.name;
	badge.textContent = recipe.characterRequired || 'DST';
	badge.classList.toggle('is-warly', Boolean(recipe.characterRequired));
	node.querySelector('.recipe-stats').append(renderStats(recipe));
	node.querySelector('.combo-row').append(renderCombo(combo, selectedIds, selectedKeys));

	return node;
}

function renderSharedTags(selectedIngredients) {
	const fragment = document.createDocumentFragment();
	if (selectedIngredients.length === 0) {
		return fragment;
	}

	const sharedTags = Object.keys(selectedIngredients[0].tags).filter(tag =>
		selectedIngredients.every(ingredient => ingredient.tags[tag]),
	);

	if (sharedTags.length === 0) {
		const chip = document.createElement('span');
		chip.className = 'tag-chip';
		chip.textContent = 'mixed';
		fragment.append(chip);
		return fragment;
	}

	for (const tag of sharedTags) {
		const chip = document.createElement('span');
		chip.className = 'tag-chip';
		chip.textContent = tag;
		fragment.append(chip);
	}

	return fragment;
}

function renderSelectedChips(selectedIngredients) {
	const fragment = document.createDocumentFragment();
	for (const ingredient of selectedIngredients) {
		const chip = document.createElement('button');
		chip.className = 'selected-chip';
		chip.type = 'button';
		chip.append(renderImage(ingredient, 'selected-chip-image'));
		const label = document.createElement('span');
		label.textContent = displayName(ingredient);
		chip.append(label);
		chip.addEventListener('click', () => {
			toggleIngredient(ingredient.key);
			renderAll();
		});
		fragment.append(chip);
	}
	return fragment;
}

function renderImage(item, className) {
	const image = document.createElement('img');
	image.className = className;
	image.src = item.imageUrl;
	image.alt = displayName(item);
	image.loading = 'lazy';
	image.addEventListener('error', () => {
		image.replaceWith(renderImageFallback(item, className));
	});
	return image;
}

function renderImageFallback(item, className) {
	const fallback = document.createElement('span');
	fallback.className = `${className} image-fallback`;
	fallback.textContent = displayName(item).slice(0, 1);
	return fallback;
}

function renderStats(recipe) {
	const fragment = document.createDocumentFragment();
	const stats = [
		['priority', recipe.priority],
		['hunger', recipe.hunger],
		['health', recipe.health],
		['sanity', recipe.sanity],
		['cook', recipe.cooktime],
	];

	for (const [label, value] of stats) {
		if (value === '' || value === null || value === undefined) {
			continue;
		}

		const chip = document.createElement('span');
		chip.className = 'stat-chip';
		chip.textContent = `${label} ${formatNumber(value)}`;
		fragment.append(chip);
	}

	return fragment;
}

function renderCombo(combo, selectedIds, selectedKeys) {
	const fragment = document.createDocumentFragment();
	for (const ingredient of combo) {
		const chip = document.createElement('span');
		chip.className = 'combo-chip';
		chip.classList.toggle(
			'is-selected-source',
			selectedIds.has(ingredient.id) || selectedKeys.has(ingredient.key),
		);
		chip.append(renderImage(ingredient, 'combo-chip-image'));
		const label = document.createElement('span');
		label.textContent = ingredient.zhName || ingredient.name;
		chip.append(label);
		fragment.append(chip);
	}
	return fragment;
}

function displayName(item) {
	return item.zhName || item.name;
}

function formatNumber(value) {
	if (typeof value !== 'number') {
		return value;
	}

	if (Number.isInteger(value)) {
		return value;
	}

	return Number(value.toFixed(2));
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
