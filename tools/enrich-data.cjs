const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data/lookup.json');
const SUMMARY_CSV = path.join(ROOT, 'data/dst_crockpot_ingredient_lookup.csv');
const EDGES_CSV = path.join(ROOT, 'data/dst_crockpot_ingredient_recipe_edges.csv');
const IMAGE_BASE_URL = 'https://bluehexagons.github.io/foodguide/img/';

const tagZh = {
	bug: '昆蟲係數',
	dairy: '乳製係數',
	decoration: '裝飾係數',
	egg: '蛋類係數',
	fat: '油脂係數',
	fish: '魚類係數',
	frozen: '冰凍係數',
	fruit: '水果係數',
	inedible: '不可食用',
	magic: '魔法係數',
	meat: '肉類係數',
	monster: '怪物係數',
	seed: '種子係數',
	sweetener: '甜味係數',
	veggie: '蔬菜係數',
};

const ingredientZh = {
	acorn: '樺栗果',
	acorn_cooked: '烤樺栗果',
	asparagus: '蘆筍',
	asparagus_cooked: '烤蘆筍',
	barnacle: '藤壺',
	barnacle_cooked: '熟藤壺',
	batnose: '裸露鼻孔',
	batnose_cooked: '焦烤鼻孔',
	batwing: '蝙蝠翅膀',
	batwing_cooked: '熟蝙蝠翅膀',
	berries: '漿果',
	berries_cooked: '烤漿果',
	berries_juicy: '多汁漿果',
	berries_juicy_cooked: '烤多汁漿果',
	bird_egg: '蛋',
	bird_egg_cooked: '熟蛋',
	blue_mushroom: '藍蘑菇',
	blue_mushroom_cooked: '熟藍蘑菇',
	boneshard: '骨頭碎片',
	butter: '奶油',
	butterflywings: '蝴蝶翅膀',
	cactusflower: '仙人掌花',
	cactusmeat: '仙人掌肉',
	cactusmeat_cooked: '熟仙人掌肉',
	carrot: '胡蘿蔔',
	carrot_cooked: '烤胡蘿蔔',
	cave_banana: '香蕉',
	cave_banana_cooked: '熟香蕉',
	corn: '玉米',
	corn_cooked: '爆米花',
	cutlichen: '苔蘚',
	dragonfruit: '火龍果',
	dragonfruit_cooked: '熟火龍果',
	drumstick: '雞腿',
	drumstick_cooked: '炸雞腿',
	durian: '榴槤',
	durian_cooked: '超臭榴槤',
	eel: '鰻魚',
	eel_cooked: '熟鰻魚',
	eggplant: '茄子',
	eggplant_cooked: '烤茄子',
	fig: '無花果',
	fig_cooked: '熟無花果',
	fish: '魚',
	fish_cooked: '熟魚',
	fishmeat: '魚肉',
	fishmeat_cooked: '熟魚肉',
	fishmeat_small: '小魚肉',
	fishmeat_small_cooked: '熟小魚肉',
	forgetmelots: '必忘我',
	froglegs: '蛙腿',
	froglegs_cooked: '熟蛙腿',
	garlic: '大蒜',
	garlic_cooked: '烤大蒜',
	goatmilk: '帶電羊奶',
	green_mushroom: '綠蘑菇',
	green_mushroom_cooked: '熟綠蘑菇',
	honey: '蜂蜜',
	honeycomb: '蜂巢',
	ice: '冰',
	kelp: '海帶葉',
	kelp_cooked: '熟海帶葉',
	kelp_dried: '乾海帶葉',
	lightninggoathorn: '伏特羊角',
	mandrake: '曼德拉草',
	meat: '肉',
	meat_cooked: '熟肉',
	meat_dried: '肉乾',
	milkywhites: '乳白物',
	mole: '鼴鼠',
	monstermeat: '怪物肉',
	monstermeat_cooked: '熟怪物肉',
	monstermeat_dried: '怪物肉乾',
	moon_mushroom: '月亮蘑菇',
	moon_mushroom_cooked: '熟月亮蘑菇',
	moonbutterflywings: '月蛾翅膀',
	morsel: '小肉',
	morsel_cooked: '熟小肉',
	morsel_dried: '小肉乾',
	nightmarefuel: '噩夢燃料',
	onion: '洋蔥',
	onion_cooked: '烤洋蔥',
	pepper: '辣椒',
	pepper_cooked: '烤辣椒',
	plantmeat: '葉肉',
	plantmeat_cooked: '熟葉肉',
	pondeel: '活鰻魚',
	pondfish: '淡水魚',
	pomegranate: '石榴',
	pomegranate_cooked: '切片石榴',
	potato: '馬鈴薯',
	potato_cooked: '烤馬鈴薯',
	pumpkin: '南瓜',
	pumpkin_cooked: '熱南瓜',
	red_mushroom: '紅蘑菇',
	red_mushroom_cooked: '熟紅蘑菇',
	refined_dust: '塵土塊',
	rock_avocado_fruit_ripe: '成熟石果',
	rock_avocado_fruit_ripe_cooked: '熟石果',
	royal_jelly: '蜂王漿',
	tallbirdegg: '高腳鳥蛋',
	tallbirdegg_cooked: '煎高腳鳥蛋',
	tomato: '番茄根',
	tomato_cooked: '烤番茄根',
	trunk_summer: '無尾象鼻',
	trunk_summer_cooked: '無尾象鼻排',
	trunk_winter: '冬象鼻',
	twigs: '樹枝',
	watermelon: '西瓜',
	watermelon_cooked: '烤西瓜',
	wobster: '龍蝦',
	wormlight: '發光漿果',
	wormlight_lesser: '小發光漿果',
	oceanfish_medium_1_inv: '泥魚',
	oceanfish_medium_2_inv: '深海鱸魚',
	oceanfish_medium_3_inv: '蒲公獅魚',
	oceanfish_medium_4_inv: '黑鯰魚',
	oceanfish_medium_5_inv: '玉米鱈魚',
	oceanfish_medium_6_inv: '錦鯉',
	oceanfish_medium_7_inv: '金錦鯉',
	oceanfish_medium_8_inv: '冰鯛魚',
	oceanfish_medium_9_inv: '甜味魚',
	oceanfish_small_1_inv: '小孔雀魚',
	oceanfish_small_2_inv: '針鼻噴水魚',
	oceanfish_small_3_inv: '小餌魚',
	oceanfish_small_4_inv: '小煎魚',
	oceanfish_small_5_inv: '爆米花魚',
	oceanfish_small_6_inv: '秋比目魚',
	oceanfish_small_7_inv: '花鰭鮪魚',
	oceanfish_small_8_inv: '灼熱太陽魚',
	oceanfish_small_9_inv: '吐沫魚',
};

const recipeZh = {
	asparagussoup_dst: '蘆筍湯',
	baconeggs_dst: '培根煎蛋',
	bananajuice: '香蕉奶昔',
	bananapop_dst: '香蕉冰棒',
	barnaclepita: '藤壺皮塔餅',
	barnaclesushi: '藤壺握壽司',
	barnaclinguine: '藤壺義大利麵',
	barnaclestuffedfishhead: '釀魚頭',
	batnosehat: '奶香帽',
	beefalofeed: '蒸樹枝',
	beefalotreat: '皮弗婁牛零食',
	bonestew_dst: '肉湯',
	bonesoup: '骨頭清湯',
	bunnystew: '兔肉燉湯',
	butterflymuffin_dst: '蝴蝶鬆餅',
	californiaroll_dst: '加州卷',
	ceviche_dst: '酸橘汁醃魚',
	dragonchilisalad: '辣龍椒沙拉',
	dragonpie_dst: '火龍果派',
	dustmeringue: '琥珀美食',
	figatoni: '無花果通心粉',
	figkabab: '無花果烤串',
	fishtacos_dst: '魚肉玉米餅',
	fishsticks_dst: '魚排',
	flowersalad_dst: '花沙拉',
	freshfruitcrepes_dst: '鮮果可麗餅',
	frogfishbowl: '魚肉藍帶',
	frogglebunwich_dst: '蛙腿三明治',
	frognewton: '無花果蛙腿三明治',
	frozenbananadaiquiri: '冰香蕉代基里',
	fruitmedley_dst: '水果聖代',
	gazpacho: '蘆筍冷湯',
	glowberrymousse: '發光漿果慕斯',
	guacamole_dst: '酪梨醬',
	honeyham_dst: '蜜汁火腿',
	honeynuggets_dst: '蜜汁肉塊',
	hotchili_dst: '辣椒燉肉',
	icecream_dst: '冰淇淋',
	jammypreserves_dst: '一把果醬',
	jellybean: '彩虹糖豆',
	justeggs: '純煎蛋',
	kabobs_dst: '肉串',
	koalefig_trunk: '無花果釀象鼻',
	leafloaf: '葉肉糕',
	leafymeatburger: '葉肉漢堡',
	leafymeatsouffle: '果凍沙拉',
	mandrakesoup_dst: '曼德拉草湯',
	mashedpotatoes: '奶油馬鈴薯泥',
	meatballs_dst: '肉丸',
	meatysalad: '牛肉青蔬',
	monsterlasagna_dst: '怪物千層麵',
	monstertartare_dst: '怪物韃靼',
	moqueca: '巴西海鮮燉魚',
	nightmarepie: '恐怖國王餅',
	pepperpopper: '釀辣椒',
	perogies_dst: '波蘭餃子',
	potatotornado: '螺旋薯塔',
	potatosouffle: '馬鈴薯舒芙蕾',
	powcake_dst: '粉末蛋糕',
	pumpkincookie_dst: '南瓜餅乾',
	ratatouille_dst: '蔬菜雜燴',
	salsa: '莎莎醬',
	seafoodgumbo_dst: '海鮮濃湯',
	shroomcake: '蘑菇蛋糕',
	stuffedeggplant_dst: '釀茄子',
	surfnturf_dst: '海陸大餐',
	sweettea: '舒緩茶',
	taffy_dst: '太妃糖',
	talleggs: '高腳鳥蘇格蘭蛋',
	trailmix_dst: '什錦堅果',
	turkeydinner_dst: '火雞大餐',
	unagi_dst: '鰻魚料理',
	vegstinger: '蔬菜雞尾酒',
	veggieomlet: '早餐鍋',
	voltgoatjelly: '伏特羊果凍',
	waffles_dst: '華夫餅',
	watermelonicle_dst: '西瓜冰',
	lobsterbisque_dst: '龍蝦濃湯',
	lobsterdinner_dst: '龍蝦晚餐',
};

const extraIngredientTags = {
	butterflywings: { bug: 1 },
	moonbutterflywings: { bug: 1 },
	forgetmelots: { decoration: 1 },
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});

async function main() {
	const sourceModuleUrl = pathToFileURL(path.join(ROOT, '../work/source/recipes.js')).href;
	const { recipes: sourceRecipes } = await import(sourceModuleUrl);
	const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

	for (const ingredient of data.ingredients) {
		ingredient.zhName = ingredientZh[ingredient.id] || ingredient.name;
		ingredient.imageUrl = imageUrl(ingredient.name);
		ingredient.tags = {
			...(ingredient.tags || {}),
			...(extraIngredientTags[ingredient.id] || {}),
		};
	}

	for (const recipe of Object.values(data.recipes)) {
		const sourceRecipe = sourceRecipes[recipe.id];
		recipe.zhName = recipeZh[recipe.id] || recipe.name;
		recipe.imageUrl = imageUrl(recipe.name);
		recipe.requirementLines = buildRequirementLines(sourceRecipe, data.ingredients);
		recipe.requirementText = recipe.requirementLines.join('、');
		recipe.requirementRules = (sourceRecipe?.requirements || []).map(serializeRequirement);
	}

	addDirectRequirements(data, sourceRecipes);

	const ingredientByKey = new Map(data.ingredients.map(ingredient => [ingredient.key, ingredient]));
	const ingredientById = new Map(data.ingredients.map(ingredient => [ingredient.id, ingredient]));

	for (const edge of data.edges) {
		const ingredient = ingredientByKey.get(edge.ingredientKey);
		const recipe = data.recipes[edge.recipeId];
		edge.ingredientName = ingredient?.name || edge.ingredientKey;
		edge.ingredientZhName = ingredient?.zhName || edge.ingredientName;
		edge.recipeName = recipe?.name || edge.recipeId;
		edge.recipeZhName = recipe?.zhName || edge.recipeName;
		edge.exampleCombo = edge.exampleCombo.map(item => {
			const fullIngredient = ingredientByKey.get(item.key) || ingredientById.get(item.id);
			return {
				...item,
				zhName: fullIngredient?.zhName || ingredientZh[item.id] || item.name,
				imageUrl: fullIngredient?.imageUrl || imageUrl(item.name),
			};
		});
	}

	data.metadata.image_source = {
		name: 'Bluehexagons Food Guide images',
		url: 'https://bluehexagons.github.io/foodguide/img/',
	};
	data.metadata.zh_name_source =
		'Manual Traditional Chinese draft names; English names are preserved as fallback.';
	data.metadata.direct_requirement_source =
		'Recipe requirement declarations from the Food Guide data modules.';
	data.metadata.requirement_text_source =
		'Chinese summary generated from the Food Guide recipe requirement declarations.';

	fs.writeFileSync(DATA_FILE, `${JSON.stringify(data)}\n`);
	writeCsv(SUMMARY_CSV, summaryColumns(), summaryRows(data));
	writeCsv(EDGES_CSV, edgeColumns(), edgeRows(data));

	console.log(
		JSON.stringify(
			{
				ingredients: data.ingredients.length,
				recipes: Object.keys(data.recipes).length,
				edges: data.edges.length,
				bytes: fs.statSync(DATA_FILE).size,
			},
			null,
			2,
		),
	);
}

function addDirectRequirements(data, sourceRecipes) {
	const knownIngredientIds = new Set(data.ingredients.map(ingredient => ingredient.id));

	for (const recipe of Object.values(data.recipes)) {
		const sourceRecipe = sourceRecipes[recipe.id];
		const directNames = new Set();

		for (const requirement of sourceRecipe?.requirements || []) {
			collectRequirementNames(requirement, directNames);
		}

		recipe.directIngredientIds = [...expandDirectNames(directNames, knownIngredientIds)].sort();
	}
}

function collectRequirementNames(requirement, directNames) {
	if (!requirement || typeof requirement !== 'object') {
		return;
	}

	if (requirement.cancel) {
		return;
	}

	if (requirement.name) {
		directNames.add(requirement.name);
	}

	collectRequirementNames(requirement.item1, directNames);
	collectRequirementNames(requirement.item2, directNames);
	collectRequirementNames(requirement.item, directNames);
}

function expandDirectNames(directNames, knownIngredientIds) {
	const result = new Set();
	const aliases = {
		berries: ['berries', 'berries_cooked', 'berries_juicy', 'berries_juicy_cooked'],
		cactus_flower: ['cactusflower'],
		cactusflower: ['cactusflower'],
		kelp: ['kelp', 'kelp_cooked', 'kelp_dried'],
		lobster: ['wobster'],
		smallmeat: ['morsel', 'morsel_cooked', 'morsel_dried'],
		wobster_sheller_land: ['wobster'],
	};

	for (const name of directNames) {
		const candidates = [
			name,
			`${name}_cooked`,
			`${name}_dried`,
			...(aliases[name] || []),
		];

		for (const candidate of candidates) {
			if (knownIngredientIds.has(candidate)) {
				result.add(candidate);
			}
		}
	}

	return result;
}

function buildRequirementLines(sourceRecipe, ingredients) {
	const ingredientById = new Map(ingredients.map(ingredient => [ingredient.id, ingredient]));
	return (sourceRecipe?.requirements || [])
		.map(requirement => formatRequirement(requirement, ingredientById))
		.filter(Boolean);
}

function serializeRequirement(requirement) {
	if (!requirement || typeof requirement !== 'object') {
		return null;
	}

	const result = {
		type: requirement.test?.name || 'unknown',
	};

	if (requirement.cancel) {
		result.cancel = true;
	}

	if (requirement.name) {
		result.name = requirement.name;
	}

	if (requirement.tag) {
		result.tag = requirement.tag;
	}

	if (requirement.qty?.op) {
		result.qty = {
			op: requirement.qty.op,
			value: requirement.qty.qty,
		};
	}

	if (requirement.item) {
		result.item = serializeRequirement(requirement.item);
	}

	if (requirement.item1) {
		result.item1 = serializeRequirement(requirement.item1);
	}

	if (requirement.item2) {
		result.item2 = serializeRequirement(requirement.item2);
	}

	return result;
}

function formatRequirement(requirement, ingredientById) {
	if (!requirement || typeof requirement !== 'object') {
		return '';
	}

	if (requirement.test?.name === 'NOTTest' && requirement.item) {
		return `不可放 ${formatRequirementTarget(requirement.item, ingredientById)}`;
	}

	if (requirement.test?.name === 'ORTest' && requirement.item1 && requirement.item2) {
		const simplified = simplifyOrRequirement(requirement, ingredientById);
		if (simplified) {
			return simplified;
		}

		return [requirement.item1, requirement.item2]
			.map(item => formatRequirement(item, ingredientById))
			.filter(Boolean)
			.join(' 或 ');
	}

	if (requirement.test?.name === 'ANDTest' && requirement.item1 && requirement.item2) {
		return [requirement.item1, requirement.item2]
			.map(item => formatRequirement(item, ingredientById))
			.filter(Boolean)
			.join(' 且 ');
	}

	return formatPositiveRequirement(requirement, ingredientById);
}

function simplifyOrRequirement(requirement, ingredientById) {
	const items = [requirement.item1, requirement.item2];
	const positiveLimit = items.find(item => !item.cancel && hasCompareQty(item));
	const negative = items.find(item => item.test?.name === 'NOTTest' && item.item);

	if (
		positiveLimit &&
		negative &&
		requirementIdentity(positiveLimit) === requirementIdentity(negative.item)
	) {
		return formatPositiveRequirement(positiveLimit, ingredientById);
	}

	return '';
}

function requirementIdentity(requirement) {
	if (requirement?.tag) {
		return `tag:${requirement.tag}`;
	}

	if (requirement?.name) {
		return `name:${requirement.name}`;
	}

	return '';
}

function hasCompareQty(requirement) {
	return Boolean(requirement?.qty?.op);
}

function formatPositiveRequirement(requirement, ingredientById) {
	if (requirement.tag) {
		return `${tagLabel(requirement.tag)} ${formatQty(requirement.qty, 'tag')}`;
	}

	if (requirement.name) {
		return `${ingredientLabel(requirement.name, ingredientById)} ${formatQty(requirement.qty, 'name')}`;
	}

	return formatRequirementTarget(requirement, ingredientById);
}

function formatRequirementTarget(requirement, ingredientById) {
	if (!requirement || typeof requirement !== 'object') {
		return '';
	}

	if (requirement.tag) {
		return tagLabel(requirement.tag);
	}

	if (requirement.name) {
		return ingredientLabel(requirement.name, ingredientById);
	}

	if (requirement.item) {
		return formatRequirementTarget(requirement.item, ingredientById);
	}

	if (requirement.item1 && requirement.item2) {
		const joiner = requirement.test?.name === 'ANDTest' ? ' 且 ' : ' 或 ';
		return [requirement.item1, requirement.item2]
			.map(item => formatRequirementTarget(item, ingredientById))
			.filter(Boolean)
			.join(joiner);
	}

	return '';
}

function formatQty(qty, type) {
	if (qty?.op) {
		if (type === 'tag' && ['<', '<='].includes(qty.op)) {
			return `> 0 且 ${qty.op} ${formatNumber(qty.qty)}`;
		}

		return `${qty.op} ${formatNumber(qty.qty)}`;
	}

	return type === 'tag' ? '> 0' : '>= 1';
}

function formatNumber(value) {
	if (Number.isInteger(value)) {
		return String(value);
	}

	return String(Number(value.toFixed(2)));
}

function tagLabel(tag) {
	return tagZh[tag] || `${tag} 係數`;
}

function ingredientLabel(name, ingredientById) {
	const aliases = {
		cactus_flower: 'cactusflower',
		cactus_meat: 'cactusmeat',
		lobster: 'wobster',
		smallmeat: 'morsel',
		wobster_sheller_land: 'wobster',
	};
	const id = aliases[name] || name;
	const ingredient = ingredientById.get(id);
	return ingredient?.zhName || ingredientZh[id] || prettifyId(name);
}

function prettifyId(id) {
	return id
		.replace(/_cooked$/, '')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
}

function imageUrl(name) {
	return `${IMAGE_BASE_URL}${encodeURI(imageFile(name))}`;
}

function imageFile(name) {
	return `${name.replace(/ /g, '_').replace(/'/g, '').toLowerCase()}.png`;
}

function summaryColumns() {
	return [
		'ingredient_key',
		'ingredient_id',
		'ingredient_name',
		'ingredient_zh_name',
		'ingredient_tags',
		'recipe_count',
		'recipe_names',
		'recipe_zh_names',
		'recipe_ids',
		'warly_only_recipe_names',
		'warly_only_recipe_zh_names',
		'direct_recipe_names',
		'direct_recipe_zh_names',
	];
}

function summaryRows({ ingredients, recipes }) {
	return ingredients.map(ingredient => {
		const ingredientRecipes = ingredient.recipeIds.map(id => recipes[id]).filter(Boolean);
		const warlyRecipes = ingredientRecipes.filter(recipe => recipe.characterRequired);
		const directRecipes = ingredientRecipes.filter(recipe =>
			(recipe.directIngredientIds || []).includes(ingredient.id),
		);
		return {
			ingredient_key: ingredient.key,
			ingredient_id: ingredient.id,
			ingredient_name: ingredient.name,
			ingredient_zh_name: ingredient.zhName,
			ingredient_tags: formatTags(ingredient.tags),
			recipe_count: ingredientRecipes.length,
			recipe_names: ingredientRecipes.map(recipe => recipe.name).join(' | '),
			recipe_zh_names: ingredientRecipes.map(recipe => recipe.zhName).join(' | '),
			recipe_ids: ingredientRecipes.map(recipe => recipe.id).join(' | '),
			warly_only_recipe_names: warlyRecipes.map(recipe => recipe.name).join(' | '),
			warly_only_recipe_zh_names: warlyRecipes.map(recipe => recipe.zhName).join(' | '),
			direct_recipe_names: directRecipes.map(recipe => recipe.name).join(' | '),
			direct_recipe_zh_names: directRecipes.map(recipe => recipe.zhName).join(' | '),
		};
	});
}

function edgeColumns() {
	return [
		'ingredient_key',
		'ingredient_id',
		'ingredient_name',
		'ingredient_zh_name',
		'ingredient_tags',
		'recipe_id',
		'recipe_key',
		'recipe_name',
		'recipe_zh_name',
		'character_required',
		'priority',
		'foodtype',
		'health',
		'hunger',
		'sanity',
		'cooktime',
		'recipe_requirement_text',
		'example_combo_keys',
		'example_combo_names',
		'example_combo_zh_names',
		'direct_required_ingredient_ids',
		'result_scope',
	];
}

function edgeRows({ edges, recipes, ingredients }) {
	const ingredientMap = new Map(ingredients.map(ingredient => [ingredient.key, ingredient]));
	return edges.map(edge => {
		const ingredient = ingredientMap.get(edge.ingredientKey);
		const recipe = recipes[edge.recipeId];
		return {
			ingredient_key: ingredient?.key || edge.ingredientKey,
			ingredient_id: ingredient?.id || '',
			ingredient_name: ingredient?.name || edge.ingredientName,
			ingredient_zh_name: ingredient?.zhName || edge.ingredientZhName,
			ingredient_tags: formatTags(ingredient?.tags || {}),
			recipe_id: recipe?.id || edge.recipeId,
			recipe_key: recipe?.key || edge.recipeId,
			recipe_name: recipe?.name || edge.recipeName,
			recipe_zh_name: recipe?.zhName || edge.recipeZhName,
			character_required: recipe?.characterRequired || '',
			priority: recipe?.priority ?? '',
			foodtype: recipe?.foodtype || '',
			health: recipe?.health ?? '',
			hunger: recipe?.hunger ?? '',
			sanity: recipe?.sanity ?? '',
			cooktime: recipe?.cooktime ?? '',
			recipe_requirement_text: recipe?.requirementText || '',
			example_combo_keys: edge.exampleCombo.map(item => item.key).join(' + '),
			example_combo_names: edge.exampleCombo.map(item => item.name).join(' + '),
			example_combo_zh_names: edge.exampleCombo.map(item => item.zhName).join(' + '),
			direct_required_ingredient_ids: (recipe?.directIngredientIds || []).join(' | '),
			result_scope: edge.resultScope,
		};
	});
}

function formatTags(tags) {
	return Object.entries(tags)
		.map(([tag, value]) => `${tag}=${formatTagValue(value)}`)
		.join('; ');
}

function formatTagValue(value) {
	if (value === true) {
		return 'true';
	}

	if (value === false) {
		return 'false';
	}

	return value;
}

function writeCsv(filePath, columns, rows) {
	const lines = [
		columns.join(','),
		...rows.map(row => columns.map(column => csvCell(row[column])).join(',')),
	];
	fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

function csvCell(value) {
	if (value === null || value === undefined) {
		return '';
	}

	const text = String(value);
	if (/[",\n]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}

	return text;
}
