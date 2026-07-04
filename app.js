const DATA_VERSION = '20260704i';
const DATA_URL = `data/lookup.json?v=${DATA_VERSION}`;

const state = {
	data: null,
	selectedKeys: [],
	search: '',
	origin: 'all',
	category: 'all',
	includeWarly: false,
	sort: 'name',
	statSort: null,
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

const INGREDIENT_ORIGIN_CATEGORIES = [
	{ id: 'all', label: '全部' },
	{ id: 'land', label: '本島' },
	{ id: 'ocean', label: '海洋' },
	{ id: 'cave', label: '洞窟' },
];

const ORIGIN_RANK = new Map(INGREDIENT_ORIGIN_CATEGORIES.map((origin, index) => [origin.id, index]));

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

const OCEAN_ONLY_INGREDIENT_IDS = new Set([
	'barnacle',
	'fig',
	'fishmeat',
	'fishmeat_small',
	'forgetmelots',
	'kelp',
	'moonbutterflywings',
	'oceanfish_medium_1_inv',
	'oceanfish_medium_2_inv',
	'oceanfish_medium_3_inv',
	'oceanfish_medium_4_inv',
	'oceanfish_medium_5_inv',
	'oceanfish_medium_6_inv',
	'oceanfish_medium_7_inv',
	'oceanfish_medium_8_inv',
	'oceanfish_medium_9_inv',
	'oceanfish_small_1_inv',
	'oceanfish_small_2_inv',
	'oceanfish_small_3_inv',
	'oceanfish_small_4_inv',
	'oceanfish_small_5_inv',
	'oceanfish_small_6_inv',
	'oceanfish_small_7_inv',
	'oceanfish_small_8_inv',
	'oceanfish_small_9_inv',
	'rock_avocado_fruit_ripe',
	'wobster',
]);

const CAVE_ONLY_INGREDIENT_IDS = new Set([
	'batnose',
	'batwing',
	'cave_banana',
	'cutlichen',
	'eel',
	'milkywhites',
	'moon_mushroom',
	'pondeel',
	'refined_dust',
	'wormlight',
	'wormlight_lesser',
]);

const COMMON_INGREDIENT_IDS = [
	'monstermeat',
	'meat',
	'morsel',
	'bird_egg',
	'honey',
	'berries',
	'carrot',
	'twigs',
	'ice',
	'fishmeat',
	'froglegs',
	'drumstick',
	'corn',
	'pumpkin',
	'dragonfruit',
	'potato',
	'tomato',
	'kelp',
];

const COMMON_INGREDIENT_RANK = new Map(
	COMMON_INGREDIENT_IDS.map((id, index) => [id, index]),
);

const STAT_META = {
	health: {
		iconUrl: `assets/status-health.png?v=${DATA_VERSION}`,
		label: '生命',
		sortLabel: '回血量',
	},
	hunger: {
		iconUrl: `assets/status-hunger.png?v=${DATA_VERSION}`,
		label: '飽食',
		sortLabel: '飽食度',
	},
	sanity: {
		iconUrl: `assets/status-sanity.png?v=${DATA_VERSION}`,
		label: '理智',
		sortLabel: '理智值',
	},
};

const TAG_META = {
	dairy: { label: '乳製係數', representativeId: 'goatmilk' },
	egg: { label: '蛋類係數', representativeId: 'bird_egg' },
	fat: { label: '油脂係數', representativeId: 'butter' },
	fish: { label: '魚類係數', representativeId: 'fishmeat' },
	frozen: { label: '冰凍係數', representativeId: 'ice' },
	fruit: { label: '水果係數', representativeId: 'berries' },
	inedible: { label: '不可食用', representativeId: 'twigs' },
	magic: { label: '魔法係數', representativeId: 'nightmarefuel' },
	meat: { label: '肉類係數', representativeId: 'meat' },
	monster: { label: '怪物係數', representativeId: 'monstermeat' },
	seed: { label: '種子係數', representativeId: 'acorn' },
	sweetener: { label: '甜味係數', representativeId: 'honey' },
	veggie: { label: '蔬菜係數', representativeId: 'carrot' },
};

const NAME_ALIASES = {
	cactus_flower: 'cactusflower',
	cactus_meat: 'cactusmeat',
	lobster: 'wobster',
	smallmeat: 'morsel',
	wobster_sheller_land: 'wobster',
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
	origins: document.querySelector('#ingredient-origins'),
	categories: document.querySelector('#ingredient-categories'),
	includeWarly: document.querySelector('#include-warly'),
	sort: document.querySelector('#recipe-sort'),
	clearSelection: document.querySelector('#clear-selection'),
	ingredientList: document.querySelector('#ingredient-list'),
	ingredientName: document.querySelector('#ingredient-name'),
	ingredientTags: document.querySelector('#ingredient-tags'),
	selectedIngredients: document.querySelector('#selected-ingredients'),
	resultCount: document.querySelector('#result-count'),
	statSortControls: document.querySelector('#stat-sort-controls'),
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
		els.recipeGrid.innerHTML = `<div class="empty-state">資料載入或畫面渲染失敗：${escapeHtml(error.message)}</div>`;
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
		state.statSort = null;
		renderSelectionResults();
	});

	els.statSortControls.addEventListener('click', event => {
		const button = event.target.closest('.stat-sort-button');
		if (!button || button.disabled) {
			return;
		}

		setStatSort(button.dataset.statSort);
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
	const ingredientById = new Map(ingredients.map(ingredient => [ingredient.id, ingredient]));
	const recipeList = Object.values(data.recipes).sort(compareRecipesForCooking);

	return {
		...data,
		ingredients,
		ingredientMap,
		ingredientById,
		edgeMap,
		standardRecipeList: recipeList.filter(recipe => recipe.mode === 'together'),
		warlyRecipeList: recipeList.filter(recipe =>
			recipe.mode === 'together' || recipe.mode === 'warlydst',
		),
	};
}

function pickDefaultIngredient(ingredients) {
	return ingredients.find(ingredient => ingredient.id === 'monstermeat')?.key ?? ingredients[0]?.key ?? '';
}

function render() {
	els.status.textContent = `${state.data.ingredients.length} ingredients · ${Object.keys(state.data.recipes).length} recipes`;
	renderAll();
}

function renderAll() {
	renderIngredientOrigins();
	renderIngredientCategories();
	renderIngredientList();
	renderSelectionResults();
}

function renderIngredientOrigins() {
	if (!state.data) {
		return;
	}

	const fragment = document.createDocumentFragment();
	els.origins.innerHTML = '';

	for (const origin of INGREDIENT_ORIGIN_CATEGORIES) {
		const button = document.createElement('button');
		const active = state.origin === origin.id;
		button.className = 'category-tab origin-tab';
		button.type = 'button';
		button.dataset.origin = origin.id;
		button.setAttribute('role', 'tab');
		button.setAttribute('aria-selected', String(active));
		button.classList.toggle('is-active', active);
		button.textContent = `${origin.label} ${originIngredientCount(origin)}`;
		button.addEventListener('click', () => {
			state.origin = origin.id;
			renderIngredientOrigins();
			renderIngredientCategories();
			renderIngredientList();
		});
		fragment.append(button);
	}

	els.origins.append(fragment);
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
	const ingredients = sortedIngredientsForActiveView(
		state.data.ingredients.filter(matchesIngredientFilters),
	);
	const previousScrollTop = els.ingredientList.scrollTop;
	els.ingredientList.innerHTML = '';

	for (const ingredient of ingredients) {
		const node = els.ingredientTemplate.content.firstElementChild.cloneNode(true);
		const selectedCount = selectedCountForKey(ingredient.key);
		const active = selectedCount > 0;
		const isFull = state.selectedKeys.length >= 4;
		const display = displayName(ingredient);
		node.dataset.key = ingredient.key;
		node.classList.toggle('is-active', active);
		node.classList.toggle('is-maxed', isFull);
		node.setAttribute('aria-selected', String(active));
		node.setAttribute('aria-label', `${display}，已選 ${selectedCount} 個`);
		node.querySelector('.ingredient-thumb').append(renderImage(ingredient, 'ingredient-thumb-image'));
		node.querySelector('.ingredient-option-name').textContent = display;
		node.querySelector('.ingredient-option-subtitle').textContent = ingredient.name;
		const count = node.querySelector('.ingredient-option-count');
		count.textContent = visibleRecipeCount(ingredient);
		count.hidden = active;
		const stepper = node.querySelector('.ingredient-stepper');
		const selectedCountNode = node.querySelector('.ingredient-selected-count');
		const decrease = node.querySelector('.ingredient-decrease');
		const increase = node.querySelector('.ingredient-increase');
		stepper.hidden = !active;
		selectedCountNode.textContent = `x${selectedCount}`;
		decrease.disabled = !active;
		increase.disabled = isFull;
		decrease.setAttribute('aria-label', `減少 ${display}`);
		increase.setAttribute('aria-label', `增加 ${display}`);
		node.addEventListener('click', () => {
			addIngredient(ingredient.key);
			renderAll();
		});
		node.addEventListener('keydown', event => {
			if (event.key !== 'Enter' && event.key !== ' ') {
				return;
			}
			event.preventDefault();
			addIngredient(ingredient.key);
			renderAll();
		});
		decrease.addEventListener('click', event => {
			event.stopPropagation();
			removeIngredient(ingredient.key);
			renderAll();
		});
		increase.addEventListener('click', event => {
			event.stopPropagation();
			addIngredient(ingredient.key);
			renderAll();
		});
		fragment.append(node);
	}

	els.ingredientList.append(fragment);
	els.ingredientList.scrollTop = previousScrollTop;
}

function sortedIngredientsForActiveView(ingredients) {
	if (state.search) {
		return ingredients;
	}

	return [...ingredients].sort(compareIngredientListOrder);
}

function compareIngredientListOrder(a, b) {
	const originDelta = ingredientOriginRank(a) - ingredientOriginRank(b);
	if (originDelta !== 0) {
		return originDelta;
	}

	const rankA = COMMON_INGREDIENT_RANK.get(a.id) ?? Number.POSITIVE_INFINITY;
	const rankB = COMMON_INGREDIENT_RANK.get(b.id) ?? Number.POSITIVE_INFINITY;

	if (rankA !== rankB) {
		return rankA - rankB;
	}

	return displayName(a).localeCompare(displayName(b), 'zh-Hant');
}

function ingredientOriginRank(ingredient) {
	return ORIGIN_RANK.get(ingredientOrigin(ingredient)) ?? Number.POSITIVE_INFINITY;
}

function originIngredientCount(origin) {
	return state.data.ingredients.filter(ingredient =>
		matchesIngredientOrigin(ingredient, origin) &&
		matchesIngredientCategory(ingredient, activeCategory()),
	).length;
}

function categoryIngredientCount(category) {
	return state.data.ingredients.filter(ingredient =>
		matchesIngredientOrigin(ingredient, activeOrigin()) &&
		matchesIngredientCategory(ingredient, category),
	).length;
}

function matchesIngredientFilters(ingredient) {
	return matchesIngredientOrigin(ingredient, activeOrigin()) &&
		matchesIngredientCategory(ingredient, activeCategory()) &&
		matchesIngredientSearch(ingredient);
}

function activeOrigin() {
	return INGREDIENT_ORIGIN_CATEGORIES.find(origin => origin.id === state.origin) ??
		INGREDIENT_ORIGIN_CATEGORIES[0];
}

function activeCategory() {
	return INGREDIENT_CATEGORIES.find(category => category.id === state.category) ?? INGREDIENT_CATEGORIES[0];
}

function matchesIngredientOrigin(ingredient, origin) {
	if (!origin || origin.id === 'all') {
		return true;
	}

	return ingredientOrigin(ingredient) === origin.id;
}

function ingredientOrigin(ingredient) {
	const id = baseIngredientId(ingredient.id);
	if (OCEAN_ONLY_INGREDIENT_IDS.has(id)) {
		return 'ocean';
	}

	if (CAVE_ONLY_INGREDIENT_IDS.has(id)) {
		return 'cave';
	}

	return 'land';
}

function baseIngredientId(id) {
	return id
		.replace(/_cooked$/, '')
		.replace(/_dried$/, '');
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
	renderStatSortControls(resultEdges.length > 0);
	els.ingredientName.textContent = selectedIngredients.length
		? `${selectedIngredients.length} 個食材`
		: '尚未選擇';
	els.ingredientTags.innerHTML = '';
	els.ingredientTags.append(renderSharedTags(selectedIngredients));
	els.selectedIngredients.innerHTML = '';
	els.selectedIngredients.append(renderCookingSlots(selectedIngredients));
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

function setStatSort(action) {
	if (action === 'reset') {
		state.statSort = null;
		return;
	}

	if (!STAT_META[action]) {
		return;
	}

	if (state.statSort?.field === action) {
		state.statSort = {
			field: action,
			direction: state.statSort.direction === 'desc' ? 'asc' : 'desc',
		};
	} else {
		state.statSort = {
			field: action,
			direction: 'desc',
		};
	}

	state.sort = 'name';
	els.sort.value = 'name';
}

function renderStatSortControls(hasResults) {
	if (!els.statSortControls) {
		return;
	}

	for (const button of els.statSortControls.querySelectorAll('.stat-sort-button')) {
		const action = button.dataset.statSort;
		const isReset = action === 'reset';
		const active = isReset ? !state.statSort : state.statSort?.field === action;
		const direction = active && state.statSort?.field === action ? state.statSort.direction : 'none';
		button.classList.toggle('is-active', active);
		button.disabled = !hasResults;
		button.dataset.direction = direction;
		button.setAttribute('aria-pressed', String(active));

		if (isReset) {
			button.title = '使用目前排序';
			button.setAttribute('aria-label', '使用目前排序');
			continue;
		}

		const meta = STAT_META[action];
		const directionLabel = direction === 'asc' ? '低到高' : '高到低';
		button.title = `${meta.sortLabel} ${directionLabel}`;
		button.setAttribute('aria-label', `${meta.sortLabel} ${directionLabel}`);
		const arrow = button.querySelector('.stat-sort-arrow');
		if (arrow) {
			arrow.textContent = direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕';
		}
	}
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

function addIngredient(key) {
	if (state.selectedKeys.length >= 4) {
		return;
	}

	state.selectedKeys = [...state.selectedKeys, key];
}

function removeIngredient(key) {
	const index = state.selectedKeys.lastIndexOf(key);
	if (index === -1) {
		return;
	}

	removeSelectedIngredient(index);
}

function removeSelectedIngredient(index) {
	state.selectedKeys = state.selectedKeys.filter((_, selectedIndex) => selectedIndex !== index);
}

function selectedCountForKey(key) {
	return state.selectedKeys.filter(selectedKey => selectedKey === key).length;
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
	const relevanceByRecipeId = new Map();
	for (const edge of edges) {
		const recipe = state.data.recipes[edge.recipeId];
		relevanceByRecipeId.set(edge.recipeId, recipeRelevance(recipe, selectedIngredients));
	}

	return [...edges].sort((a, b) => {
		const recipeA = state.data.recipes[a.recipeId];
		const recipeB = state.data.recipes[b.recipeId];
		const relevanceA = relevanceByRecipeId.get(a.recipeId);
		const relevanceB = relevanceByRecipeId.get(b.recipeId);
		const statSortDelta = compareRecipesForActiveStatSort(recipeA, recipeB);

		if (statSortDelta !== null && statSortDelta !== 0) {
			return statSortDelta;
		}

		const relevanceDelta = compareRelevance(relevanceA, relevanceB);
		if (relevanceDelta !== 0) {
			return relevanceDelta;
		}

		return compareRecipesForSelectedSort(recipeA, recipeB);
	});
}

function compareRecipesForActiveStatSort(recipeA, recipeB) {
	if (!state.statSort) {
		return null;
	}

	const valueA = Number(recipeA[state.statSort.field] || 0);
	const valueB = Number(recipeB[state.statSort.field] || 0);
	return state.statSort.direction === 'asc' ? valueA - valueB : valueB - valueA;
}

function compareRecipesForSelectedSort(recipeA, recipeB) {
	if (state.sort === 'priority') {
		return recipeB.priority - recipeA.priority || compareRecipesByName(recipeA, recipeB);
	}

	if (['health', 'hunger', 'sanity'].includes(state.sort)) {
		return Number(recipeB[state.sort] || 0) - Number(recipeA[state.sort] || 0) ||
			compareRecipesByName(recipeA, recipeB);
	}

	return compareRecipesByName(recipeA, recipeB);
}

function compareRelevance(relevanceA, relevanceB) {
	return (
		relevanceA.tier - relevanceB.tier ||
		relevanceB.direct - relevanceA.direct ||
		relevanceB.satisfied - relevanceA.satisfied ||
		relevanceB.partial - relevanceA.partial ||
		relevanceB.value - relevanceA.value
	);
}

function compareRecipesByName(recipeA, recipeB) {
	return (
		Number(Boolean(recipeA.characterRequired)) - Number(Boolean(recipeB.characterRequired)) ||
		displayName(recipeA).localeCompare(displayName(recipeB), 'zh-Hant')
	);
}

function recipeRelevance(recipe, selectedIngredients) {
	const direct = directMatchCount(recipe, selectedIngredients);
	const conditionStats = requirementConditionStats(recipe, selectedIngredients);
	const tier = direct > 0 ? 0 : conditionStats.satisfied > 0 ? 1 : conditionStats.partial > 0 ? 2 : 3;

	return {
		tier,
		direct,
		satisfied: conditionStats.satisfied,
		partial: conditionStats.partial,
		value: conditionStats.value,
	};
}

function requirementConditionStats(recipe, selectedIngredients) {
	const totals = totalsForCombo(selectedIngredients);
	const atoms = requirementAtoms(recipe.requirementRules || [])
		.filter(atom => !atom.negated);
	let satisfied = 0;
	let partial = 0;
	let value = 0;

	for (const atom of atoms) {
		const atomValue = requirementAtomValue(atom.rule, totals, recipe);
		if (atomValue <= 0) {
			continue;
		}

		value += atomValue;
		if (evaluateRule(atom.rule, totals, recipe)) {
			satisfied += 1;
		} else {
			partial += 1;
		}
	}

	return { satisfied, partial, value };
}

function requirementAtoms(rules) {
	return rules.flatMap(rule => requirementAtomsForRule(rule, false));
}

function requirementAtomsForRule(rule, negated) {
	if (!rule) {
		return [];
	}

	if (rule.type === 'NOTTest') {
		return requirementAtomsForRule(rule.item, true);
	}

	if (rule.type === 'ORTest') {
		return [
			...requirementAtomsForRule(rule.item1, negated),
			...requirementAtomsForRule(rule.item2, negated),
		];
	}

	if (rule.type === 'ANDTest') {
		return [
			...requirementAtomsForRule(rule.item1, negated),
			...requirementAtomsForRule(rule.item2, negated),
		];
	}

	if (rule.type === 'TAGTest' || rule.type === 'NAMETest' || rule.type === 'SPECIFICTest') {
		return [{ rule, negated }];
	}

	return [];
}

function requirementAtomValue(rule, totals, recipe) {
	if (rule.type === 'TAGTest') {
		return totals.tags[rule.tag] || 0;
	}

	if (rule.type === 'NAMETest') {
		return nameValue(rule.name, totals, recipe);
	}

	if (rule.type === 'SPECIFICTest') {
		return totals.names[rule.name] || 0;
	}

	return 0;
}

function relevanceLabel(recipe, selectedIngredients) {
	const directMatches = directMatchedIngredients(recipe, selectedIngredients);
	if (directMatches.length > 0) {
		return {
			text: `指定：${summarizeIngredientNames(directMatches)}`,
			className: 'is-direct',
		};
	}

	const relevance = recipeRelevance(recipe, selectedIngredients);
	if (relevance.satisfied > 0) {
		return {
			text: '係數已符合',
			className: 'is-condition',
		};
	}

	if (relevance.partial > 0) {
		return {
			text: '係數不足',
			className: 'is-partial',
		};
	}

	return {
		text: '填充可用',
		className: '',
	};
}

function summarizeIngredientNames(ingredients) {
	const counts = new Map();
	for (const ingredient of ingredients) {
		const name = displayName(ingredient);
		counts.set(name, (counts.get(name) || 0) + 1);
	}

	return [...counts.entries()]
		.map(([name, count]) => count > 1 ? `${name} x${count}` : name)
		.join('、');
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
	const matchRow = node.querySelector('.match-row');
	const matchLabel = relevanceLabel(recipe, selectedIngredients);

	node.querySelector('.recipe-art').append(renderImage(recipe, 'recipe-image'));
	node.querySelector('h2').textContent = displayName(recipe);
	node.querySelector('.recipe-subtitle').textContent = recipe.name;
	badge.textContent = recipe.characterRequired || 'DST';
	badge.classList.toggle('is-warly', Boolean(recipe.characterRequired));
	matchRow.textContent = matchLabel.text;
	matchRow.className = 'match-row';
	if (matchLabel.className) {
		matchRow.classList.add(matchLabel.className);
	}
	appendTo(node, '.recipe-stats', renderStats(recipe));
	appendTo(node, '.recipe-meta', renderRecipeMeta(recipe));
	appendTo(node, '.recipe-requirements', renderRequirementBoard(recipe));

	return node;
}

function appendTo(root, selector, child) {
	const target = root.querySelector(selector);
	if (target) {
		target.append(child);
	}
}

function renderRecipeMeta(recipe) {
	const fragment = document.createDocumentFragment();
	const metaItems = [
		['Priority', recipe.priority],
		['Cook', recipe.cooktime],
	];

	for (const [label, value] of metaItems) {
		if (value === '' || value === null || value === undefined) {
			continue;
		}

		const chip = document.createElement('span');
		chip.className = 'meta-chip';
		chip.textContent = `${label} ${formatNumber(value)}`;
		fragment.append(chip);
	}

	return fragment;
}

function renderRequirementBoard(recipe) {
	const fragment = document.createDocumentFragment();
	const title = document.createElement('div');
	title.className = 'requirement-title';
	title.textContent = '料理條件';
	fragment.append(title);

	const list = document.createElement('div');
	list.className = 'requirement-list';
	const conditions = visualRequirements(recipe.requirementRules || [], recipe);

	for (const condition of conditions) {
		list.append(renderRequirementChip(condition));
	}

	if (conditions.length === 0) {
		const chip = document.createElement('span');
		chip.className = 'requirement-chip';
		chip.textContent = '任意食材';
		list.append(chip);
	}

	fragment.append(list);
	return fragment;
}

function renderRequirementChip(condition) {
	const chip = document.createElement('span');
	chip.className = 'requirement-chip';
	chip.classList.toggle('is-ban', condition.banned);
	chip.classList.toggle('is-soft-limit', condition.softLimit);

	for (const item of condition.iconItems || []) {
		const icon = renderImage(item, 'requirement-icon');
		chip.append(icon);
	}

	const label = document.createElement('span');
	label.textContent = condition.label;
	chip.append(label);
	return chip;
}

function visualRequirements(rules, recipe) {
	return rules
		.map(rule => visualRequirement(rule, recipe))
		.flat()
		.filter(Boolean);
}

function visualRequirement(rule, recipe) {
	if (!rule) {
		return null;
	}

	if (rule.type === 'NOTTest') {
		const target = visualTarget(rule.item, recipe);
		if (!target) {
			return null;
		}

		return {
			...target,
			banned: true,
			label: `不可放 ${banLabel(target.label)}`,
		};
	}

	if (rule.type === 'ORTest') {
		const simplified = simplifiedLimitRequirement(rule, recipe);
		if (simplified) {
			return simplified;
		}

		const item1 = visualRequirement(rule.item1, recipe);
		const item2 = visualRequirement(rule.item2, recipe);
		const options = [item1, item2].flat().filter(Boolean);
		if (options.length === 0) {
			return null;
		}

		return {
			iconItems: uniqueIconItems(options.flatMap(option => option.iconItems || [])),
			label: options.map(option => option.label).join(' 或 '),
		};
	}

	if (rule.type === 'ANDTest') {
		return [visualRequirement(rule.item1, recipe), visualRequirement(rule.item2, recipe)]
			.flat()
			.filter(Boolean);
	}

	return visualTarget(rule, recipe);
}

function simplifiedLimitRequirement(rule, recipe) {
	const items = [rule.item1, rule.item2];
	const positiveLimit = items.find(item => !item?.cancel && item?.qty?.op);
	const negative = items.find(item => item?.type === 'NOTTest' && item.item);

	if (!positiveLimit || !negative) {
		return null;
	}

	if (requirementIdentity(positiveLimit) !== requirementIdentity(negative.item)) {
		return null;
	}

	return visualTarget(positiveLimit, recipe);
}

function requirementIdentity(rule) {
	if (rule?.tag) {
		return `tag:${rule.tag}`;
	}

	if (rule?.name) {
		return `name:${rule.name}`;
	}

	return '';
}

function visualTarget(rule, recipe) {
	if (!rule) {
		return null;
	}

	if (rule.type === 'ORTest' || rule.type === 'ANDTest') {
		return visualRequirement(rule, recipe);
	}

	if (rule.tag) {
		const meta = TAG_META[rule.tag] || { label: `${rule.tag} 係數` };
		return {
			iconItems: [representativeIngredient(meta.representativeId)].filter(Boolean),
			label: `${meta.label} ${formatRuleQty(rule.qty, 'tag')}`,
			softLimit: ['<', '<='].includes(rule.qty?.op),
		};
	}

	if (rule.name) {
		const item = ingredientForRuleName(rule.name);
		return {
			iconItems: [item].filter(Boolean),
			label: `${item?.zhName || item?.name || prettifyId(rule.name)} ${formatRuleQty(rule.qty, 'name')}`,
			softLimit: ['<', '<='].includes(rule.qty?.op),
		};
	}

	return null;
}

function representativeIngredient(id) {
	if (!id) {
		return null;
	}

	return state.data.ingredientById.get(id) || null;
}

function ingredientForRuleName(name) {
	const id = NAME_ALIASES[name] || name;
	return state.data.ingredientById.get(id) ||
		state.data.ingredientById.get(`${id}_cooked`) ||
		null;
}

function uniqueIconItems(items) {
	const seen = new Set();
	const unique = [];

	for (const item of items) {
		if (!item || seen.has(item.id)) {
			continue;
		}

		seen.add(item.id);
		unique.push(item);
	}

	return unique;
}

function formatRuleQty(qty, type) {
	if (qty?.op) {
		if (type === 'tag' && ['<', '<='].includes(qty.op)) {
			return `> 0 且 ${qty.op} ${formatNumber(qty.value)}`;
		}

		return `${qty.op} ${formatNumber(qty.value)}`;
	}

	return type === 'tag' ? '> 0' : '>= 1';
}

function banLabel(label) {
	return label.replace(/ (?:> 0|>= 1)$/, '');
}

function prettifyId(id) {
	return id
		.replace(/_cooked$/, '')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
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

function renderCookingSlots(selectedIngredients) {
	const fragment = document.createDocumentFragment();
	for (let index = 0; index < 4; index++) {
		const ingredient = selectedIngredients[index];
		const chip = document.createElement('button');
		chip.className = 'cook-slot';
		chip.type = 'button';
		chip.dataset.slot = String(index + 1);

		if (!ingredient) {
			chip.classList.add('is-empty');
			chip.disabled = true;
			chip.setAttribute('aria-label', `第 ${index + 1} 格空槽`);
			const empty = document.createElement('span');
			empty.className = 'cook-slot-empty';
			empty.textContent = index + 1;
			chip.append(empty);
			fragment.append(chip);
			continue;
		}

		chip.classList.add('is-filled');
		chip.title = `移除 ${displayName(ingredient)}`;
		chip.setAttribute('aria-label', `移除第 ${index + 1} 格 ${displayName(ingredient)}`);
		chip.append(renderImage(ingredient, 'cook-slot-image'));
		const label = document.createElement('span');
		label.className = 'cook-slot-name';
		label.textContent = displayName(ingredient);
		chip.append(label);
		chip.addEventListener('click', () => {
			removeSelectedIngredient(index);
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
		['health', recipe.health],
		['hunger', recipe.hunger],
		['sanity', recipe.sanity],
	];

	for (const [id, value] of stats) {
		if (value === '' || value === null || value === undefined) {
			continue;
		}

		const meta = STAT_META[id];
		const chip = document.createElement('span');
		chip.className = `stat-chip is-${id}`;
		chip.title = `${meta.label} ${formatNumber(value)}`;
		chip.setAttribute('aria-label', `${meta.label} ${formatNumber(value)}`);
		chip.append(renderStatusIcon(meta, 'stat-icon'));
		const valueNode = document.createElement('span');
		valueNode.textContent = formatSignedNumber(value);
		chip.append(valueNode);
		fragment.append(chip);
	}

	return fragment;
}

function renderStatusIcon(meta, className) {
	const image = document.createElement('img');
	image.className = className;
	image.src = meta.iconUrl;
	image.alt = '';
	image.loading = 'lazy';
	image.decoding = 'async';
	image.addEventListener('error', () => {
		image.replaceWith(renderImageFallback({ zhName: meta.label, name: meta.label }, className));
	});
	return image;
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

function formatSignedNumber(value) {
	const formatted = formatNumber(value);
	if (typeof value !== 'number' || value <= 0) {
		return formatted;
	}

	return `+${formatted}`;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
