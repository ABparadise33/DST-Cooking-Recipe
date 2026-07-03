const DATA_URL = 'data/lookup.json';

const state = {
	data: null,
	selectedKey: '',
	search: '',
	includeWarly: true,
	sort: 'name',
};

const els = {
	status: document.querySelector('#dataset-status'),
	search: document.querySelector('#ingredient-search'),
	includeWarly: document.querySelector('#include-warly'),
	sort: document.querySelector('#recipe-sort'),
	ingredientList: document.querySelector('#ingredient-list'),
	ingredientName: document.querySelector('#ingredient-name'),
	ingredientTags: document.querySelector('#ingredient-tags'),
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
		state.selectedKey = pickDefaultIngredient(state.data.ingredients);
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
		renderSelectedIngredient();
	});

	els.sort.addEventListener('change', event => {
		state.sort = event.target.value;
		renderSelectedIngredient();
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

	const ingredients = [...data.ingredients].sort((a, b) => a.name.localeCompare(b.name));

	return {
		...data,
		ingredients,
		edgeMap,
	};
}

function pickDefaultIngredient(ingredients) {
	return ingredients.find(ingredient => ingredient.id === 'berries')?.key ?? ingredients[0]?.key ?? '';
}

function render() {
	els.status.textContent = `${state.data.ingredients.length} ingredients · ${Object.keys(state.data.recipes).length} recipes`;
	renderIngredientList();
	renderSelectedIngredient();
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
		node.dataset.key = ingredient.key;
		node.classList.toggle('is-active', ingredient.key === state.selectedKey);
		node.setAttribute('aria-selected', String(ingredient.key === state.selectedKey));
		node.querySelector('.ingredient-option-name').textContent = ingredient.name;
		node.querySelector('.ingredient-option-count').textContent = visibleRecipeCount(ingredient);
		node.addEventListener('click', () => {
			state.selectedKey = ingredient.key;
			renderIngredientList();
			renderSelectedIngredient();
		});
		fragment.append(node);
	}

	els.ingredientList.append(fragment);
}

function renderSelectedIngredient() {
	if (!state.data) {
		return;
	}

	const ingredient = state.data.ingredients.find(item => item.key === state.selectedKey);
	if (!ingredient) {
		els.ingredientName.textContent = '-';
		els.ingredientTags.innerHTML = '';
		els.resultCount.textContent = '0 recipes';
		els.recipeGrid.innerHTML = '<div class="empty-state">沒有符合的食材</div>';
		return;
	}

	const edges = sortedEdges(visibleEdgesFor(ingredient));
	els.ingredientName.textContent = ingredient.name;
	els.ingredientTags.innerHTML = '';
	els.ingredientTags.append(renderTags(ingredient.tags));
	els.resultCount.textContent = `${edges.length} recipes`;
	els.recipeGrid.innerHTML = '';

	if (edges.length === 0) {
		els.recipeGrid.innerHTML = '<div class="empty-state">這個篩選沒有可顯示的料理</div>';
		return;
	}

	const fragment = document.createDocumentFragment();
	for (const edge of edges) {
		fragment.append(renderRecipeCard(edge));
	}
	els.recipeGrid.append(fragment);
}

function matchesIngredientSearch(ingredient) {
	if (!state.search) {
		return true;
	}

	return (
		ingredient.name.toLowerCase().includes(state.search) ||
		ingredient.id.toLowerCase().includes(state.search) ||
		ingredient.key.toLowerCase().includes(state.search)
	);
}

function visibleRecipeCount(ingredient) {
	return visibleEdgesFor(ingredient).length;
}

function visibleEdgesFor(ingredient) {
	const edges = state.data.edgeMap.get(ingredient.key) ?? [];
	if (state.includeWarly) {
		return edges;
	}

	return edges.filter(edge => !state.data.recipes[edge.recipeId]?.characterRequired);
}

function sortedEdges(edges) {
	return [...edges].sort((a, b) => {
		const recipeA = state.data.recipes[a.recipeId];
		const recipeB = state.data.recipes[b.recipeId];

		if (state.sort === 'priority') {
			return recipeB.priority - recipeA.priority || recipeA.name.localeCompare(recipeB.name);
		}

		if (state.sort === 'hunger') {
			return Number(recipeB.hunger || 0) - Number(recipeA.hunger || 0) || recipeA.name.localeCompare(recipeB.name);
		}

		return (
			Number(Boolean(recipeA.characterRequired)) - Number(Boolean(recipeB.characterRequired)) ||
			recipeA.name.localeCompare(recipeB.name)
		);
	});
}

function renderRecipeCard(edge) {
	const recipe = state.data.recipes[edge.recipeId];
	const node = els.recipeTemplate.content.firstElementChild.cloneNode(true);
	const badge = node.querySelector('.badge');

	node.querySelector('h2').textContent = recipe.name;
	badge.textContent = recipe.characterRequired || 'DST';
	badge.classList.toggle('is-warly', Boolean(recipe.characterRequired));
	node.querySelector('.recipe-stats').append(renderStats(recipe));
	node.querySelector('.combo-row').append(renderCombo(edge.exampleCombo));

	return node;
}

function renderTags(tags) {
	const fragment = document.createDocumentFragment();
	const entries = Object.entries(tags);

	if (entries.length === 0) {
		const chip = document.createElement('span');
		chip.className = 'tag-chip';
		chip.textContent = 'filler';
		fragment.append(chip);
		return fragment;
	}

	for (const [tag, value] of entries) {
		const chip = document.createElement('span');
		chip.className = 'tag-chip';
		chip.textContent = `${tag} ${value}`;
		fragment.append(chip);
	}

	return fragment;
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

function renderCombo(combo) {
	const fragment = document.createDocumentFragment();
	for (const ingredient of combo) {
		const chip = document.createElement('span');
		chip.className = 'combo-chip';
		chip.textContent = ingredient.name;
		fragment.append(chip);
	}
	return fragment;
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
