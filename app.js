const DATA_URL = 'data/lookup.json';

const state = {
	data: null,
	selectedKeys: [],
	search: '',
	category: 'all',
	includeWarly: true,
	sort: 'name',
};

const INGREDIENT_CATEGORIES = [
	{ id: 'all', label: '全部' },
	{ id: 'meat', label: '肉類', tag: 'meat' },
	{ id: 'fish', label: '魚類', tag: 'fish' },
	{ id: 'veggie', label: '蔬菜', tag: 'veggie' },
	{ id: 'fruit', label: '水果', tag: 'fruit' },
	{ id: 'egg', label: '蛋', tag: 'egg' },
	{ id: 'sweetener', label: '甜味', tag: 'sweetener' },
	{ id: 'monster', label: '怪物', tag: 'monster' },
	{ id: 'inedible', label: '不可食', tag: 'inedible' },
	{ id: 'filler', label: '填充/其他' },
];

const FILLER_EXCLUDED_TAGS = new Set([
	'egg',
	'fish',
	'fruit',
	'inedible',
	'meat',
	'monster',
	'sweetener',
	'veggie',
]);

const STAT_META = {
	priority: { label: 'priority' },
	hunger: { icon: 'hunger', label: '飽食' },
	health: { icon: 'health', label: '生命' },
	sanity: { icon: 'sanity', label: '理智' },
	cook: { label: 'cook' },
};

const STAT_ICON_PATHS = {
	hunger: [
		'M5 3v7',
		'M8 3v7',
		'M3 3v5a3.5 3.5 0 0 0 7 0V3',
		'M6.5 10v11',
		'M17 3v18',
		'M17 3c2.6 1.8 4 4.7 4 8h-4',
	],
	health: [
		'M12 21s-7.2-4.4-9.2-8.7C1.2 8.8 3.2 5 6.8 5c2 0 3.3 1.1 5.2 3.2C13.9 6.1 15.2 5 17.2 5c3.6 0 5.6 3.8 4 7.3C19.2 16.6 12 21 12 21z',
	],
	sanity: [
		'M20 12a8 8 0 1 1-8-8',
		'M16 12a4 4 0 1 1-4-4',
		'M12 12h.01',
	],
};

const NAME_VARIANTS = {
	berries: ['berries', 'berries_cooked', 'berries_juicy', 'berries_juicy_cooked'],
	cactus_flower: ['cactusflower'],
	cactus_meat: ['cactusmeat', 'cactusmeat_cooked'],
	eel: ['eel', 'eel_cooked'],
	kelp: ['kelp', 'kelp_cooked'],
	lobster: ['wobster'],
	smallmeat: ['morsel', 'morsel_cooked', 'morsel_dried'],
	wobster_sheller_land: ['wobster'],
};

const RECIPE_NAME_VARIANTS = {
	batnosehat: {
		batnose: ['batnose'],
	},
	californiaroll_dst: {
		kelp: ['kelp', 'kelp_cooked', 'kelp_dried'],
	},
	unagi_dst: {
		kelp: ['kelp', 'kelp_cooked', 'kelp_dried'],
	},
};

const els = {
	status: document.querySelector('#dataset-status'),
	search: document.querySelector('#ingredient-search'),
	categories: document.querySelector('#ingredient-categories'),
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
	const recipeList = Object.values(data.recipes).sort(compareRecipesForCooking);

	return {
		...data,
		ingredients,
		ingredientMap,
		edgeMap,
		standardRecipeList: recipeList.filter(recipe => recipe.mode === 'together'),
		warlyRecipeList: recipeList.filter(recipe =>
			recipe.mode === 'together' || recipe.mode === 'warlydst',
		),
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
	renderIngredientCategories();
	renderIngredientList();
	renderSelectionResults();
}

function renderIngredientCategories() {
	if (!state.data) {
		return;
	}

	const fragment = document.createDocumentFragment();
	els.categories.innerHTML = '';

	for (const category of INGREDIENT_CATEGORIES) {
		const button = document.createElement('button');
		const active = state.category === category.id;
		button.className = 'category-tab';
		button.type = 'button';
		button.dataset.category = category.id;
		button.setAttribute('role', 'tab');
		button.setAttribute('aria-selected', String(active));
		button.classList.toggle('is-active', active);
		button.textContent = `${category.label} ${categoryIngredientCount(category)}`;
		button.addEventListener('click', () => {
			state.category = category.id;
			renderIngredientCategories();
			renderIngredientList();
		});
		fragment.append(button);
	}

	els.categories.append(fragment);
}

function renderIngredientList() {
	if (!state.data) {
		return;
	}

	const fragment = document.createDocumentFragment();
	const ingredients = state.data.ingredients.filter(matchesIngredientFilters);
	const previousScrollTop = els.ingredientList.scrollTop;
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
	els.ingredientList.scrollTop = previousScrollTop;
}

function categoryIngredientCount(category) {
	return state.data.ingredients.filter(ingredient => matchesIngredientCategory(ingredient, category)).length;
}

function matchesIngredientFilters(ingredient) {
	return matchesIngredientCategory(ingredient, activeCategory()) && matchesIngredientSearch(ingredient);
}

function activeCategory() {
	return INGREDIENT_CATEGORIES.find(category => category.id === state.category) ?? INGREDIENT_CATEGORIES[0];
}

function matchesIngredientCategory(ingredient, category) {
	if (!category || category.id === 'all') {
		return true;
	}

	const tags = ingredient.tags || {};
	if (category.id === 'filler') {
		return !Object.keys(tags).some(tag => FILLER_EXCLUDED_TAGS.has(tag));
	}

	return Boolean(tags[category.tag]);
}

function renderSelectionResults() {
	if (!state.data) {
		return;
	}

	const selectedIngredients = selectedIngredientObjects();
	const resultEdges = sortedEdges(possibleEdges(selectedIngredients), selectedIngredients);
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

function possibleEdges(selectedIngredients) {
	if (selectedIngredients.length <= 1) {
		return intersectionEdges(selectedIngredients);
	}

	return exactComboEdges(selectedIngredients);
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

function exactComboEdges(selectedIngredients) {
	const openSlots = 4 - selectedIngredients.length;
	if (openSlots < 0) {
		return [];
	}

	const results = new Map();
	enumerateFillerCombos(openSlots, fillers => {
		const combo = [...selectedIngredients, ...fillers];
		const totals = totalsForCombo(combo);
		const standardWinners = winningRecipesForCombo(state.data.standardRecipeList, totals);
		const warlyWinners = state.includeWarly
			? winningRecipesForCombo(state.data.warlyRecipeList, totals).filter(
				recipe => recipe.mode === 'warlydst',
			)
			: [];

		for (const recipe of [...standardWinners, ...warlyWinners]) {
			if (recipe.id === 'wetgoop_dst' || results.has(recipe.id)) {
				continue;
			}

			results.set(recipe.id, {
				recipeId: recipe.id,
				resultScope: recipe.mode === 'warlydst' ? 'warly' : 'standard',
				exampleCombo: combo.map(ingredient => ({
					key: ingredient.key,
					id: ingredient.id,
					name: ingredient.name,
					zhName: ingredient.zhName,
					imageUrl: ingredient.imageUrl,
				})),
			});
		}
	});

	return [...results.values()];
}

function enumerateFillerCombos(openSlots, callback) {
	const fillers = [];

	function walk(startIndex, depth) {
		if (depth === openSlots) {
			callback(fillers);
			return;
		}

		for (let index = startIndex; index < state.data.ingredients.length; index++) {
			fillers.push(state.data.ingredients[index]);
			walk(index, depth + 1);
			fillers.pop();
		}
	}

	walk(0, 0);
}

function totalsForCombo(combo) {
	const names = {};
	const tags = {};

	for (const ingredient of combo) {
		names[ingredient.id] = (names[ingredient.id] || 0) + 1;

		for (const [tag, value] of Object.entries(ingredient.tags || {})) {
			tags[tag] = (tags[tag] || 0) + value;
		}
	}

	return { names, tags };
}

function winningRecipesForCombo(recipeList, totals) {
	const winners = [];
	let winningPriority = null;

	for (const recipe of recipeList) {
		if (winningPriority !== null && recipe.priority < winningPriority) {
			break;
		}

		if (recipeMatches(recipe, totals)) {
			winningPriority = recipe.priority;
			winners.push(recipe);
		}
	}

	return winners;
}

function recipeMatches(recipe, totals) {
	const rules = recipe.requirementRules || [];
	return rules.length > 0 && rules.every(rule => evaluateRule(rule, totals, recipe));
}

function evaluateRule(rule, totals, recipe) {
	if (!rule) {
		return false;
	}

	if (rule.type === 'NOTTest') {
		return !evaluateRule(rule.item, totals, recipe);
	}

	if (rule.type === 'ORTest') {
		return evaluateRule(rule.item1, totals, recipe) || evaluateRule(rule.item2, totals, recipe);
	}

	if (rule.type === 'ANDTest') {
		return evaluateRule(rule.item1, totals, recipe) && evaluateRule(rule.item2, totals, recipe);
	}

	if (rule.type === 'TAGTest') {
		return compareQty(totals.tags[rule.tag] || 0, rule.qty);
	}

	if (rule.type === 'NAMETest') {
		return compareQty(nameValue(rule.name, totals, recipe), rule.qty);
	}

	if (rule.type === 'SPECIFICTest') {
		return compareQty(totals.names[rule.name] || 0, rule.qty);
	}

	return false;
}

function nameValue(name, totals, recipe) {
	const variants = RECIPE_NAME_VARIANTS[recipe.id]?.[name] || NAME_VARIANTS[name] || [name, `${name}_cooked`];
	const uniqueVariants = [...new Set(variants)];
	return uniqueVariants.reduce((sum, variant) => sum + (totals.names[variant] || 0), 0);
}

function compareQty(value, qty) {
	if (!qty) {
		return value > 0;
	}

	if (value <= 0) {
		return false;
	}

	if (qty.op === '=') {
		return value === qty.value;
	}

	if (qty.op === '>') {
		return value > qty.value;
	}

	if (qty.op === '<') {
		return value < qty.value;
	}

	if (qty.op === '>=') {
		return value >= qty.value;
	}

	if (qty.op === '<=') {
		return value <= qty.value;
	}

	return false;
}

function compareRecipesForCooking(a, b) {
	return (
		b.priority - a.priority ||
		Number(b.weight || 1) - Number(a.weight || 1) ||
		a.name.localeCompare(b.name) ||
		a.id.localeCompare(b.id)
	);
}

function sortedEdges(edges, selectedIngredients) {
	return [...edges].sort((a, b) => {
		const recipeA = state.data.recipes[a.recipeId];
		const recipeB = state.data.recipes[b.recipeId];
		const directDelta =
			directMatchCount(recipeB, selectedIngredients) -
			directMatchCount(recipeA, selectedIngredients);

		if (directDelta !== 0) {
			return directDelta;
		}

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

function directMatchCount(recipe, selectedIngredients) {
	const directIds = new Set(recipe.directIngredientIds || []);
	return selectedIngredients.filter(ingredient => directIds.has(ingredient.id)).length;
}

function directMatchedIngredients(recipe, selectedIngredients) {
	const directIds = new Set(recipe.directIngredientIds || []);
	return selectedIngredients.filter(ingredient => directIds.has(ingredient.id));
}

function renderRecipeCard(edge, selectedIngredients) {
	const recipe = state.data.recipes[edge.recipeId];
	const node = els.recipeTemplate.content.firstElementChild.cloneNode(true);
	const badge = node.querySelector('.badge');
	const combo = edge.exampleCombo;
	const selectedIds = new Set(selectedIngredients.map(ingredient => ingredient.id));
	const selectedKeys = new Set(selectedIngredients.map(ingredient => ingredient.key));
	const directMatches = directMatchedIngredients(recipe, selectedIngredients);
	const matchRow = node.querySelector('.match-row');

	node.querySelector('.recipe-art').append(renderImage(recipe, 'recipe-image'));
	node.querySelector('h2').textContent = displayName(recipe);
	node.querySelector('.recipe-subtitle').textContent = recipe.name;
	badge.textContent = recipe.characterRequired || 'DST';
	badge.classList.toggle('is-warly', Boolean(recipe.characterRequired));
	matchRow.textContent = directMatches.length
		? `指定：${directMatches.map(displayName).join('、')}`
		: '係數 / 填充';
	matchRow.classList.toggle('is-direct', directMatches.length > 0);
	node.querySelector('.method-row').append(renderMethod(recipe));
	node.querySelector('.recipe-stats').append(renderStats(recipe));
	node.querySelector('.combo-row').append(renderCombo(combo, selectedIds, selectedKeys));

	return node;
}

function renderMethod(recipe) {
	const fragment = document.createDocumentFragment();
	const label = document.createElement('span');
	const lines = recipe.requirementLines?.length ? recipe.requirementLines : ['任意食材'];
	label.className = 'method-label';
	label.textContent = '做法';
	fragment.append(label);

	for (const line of lines) {
		const chip = document.createElement('span');
		chip.className = 'method-chip';
		chip.textContent = line;
		fragment.append(chip);
	}

	return fragment;
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

	for (const [id, value] of stats) {
		if (value === '' || value === null || value === undefined) {
			continue;
		}

		const meta = STAT_META[id];
		const chip = document.createElement('span');
		chip.className = 'stat-chip';
		if (meta?.icon) {
			chip.classList.add('has-icon', `is-${id}`);
			chip.title = `${meta.label} ${formatNumber(value)}`;
			chip.setAttribute('aria-label', `${meta.label} ${formatNumber(value)}`);
			chip.append(renderStatIcon(meta.icon));
			const valueNode = document.createElement('span');
			valueNode.textContent = formatNumber(value);
			chip.append(valueNode);
		} else {
			chip.textContent = `${meta?.label || id} ${formatNumber(value)}`;
		}
		fragment.append(chip);
	}

	return fragment;
}

function renderStatIcon(icon) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('class', 'stat-icon');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('focusable', 'false');

	for (const d of STAT_ICON_PATHS[icon] || []) {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', d);
		svg.append(path);
	}

	return svg;
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
