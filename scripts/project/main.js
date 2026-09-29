// Cleaner.io project script
// Handles localization, skin unlock/selection data, and UI text updates.
// Gameplay movement, boost, bots, difficulty, saves, and arena logic are primarily in Construct event sheets.

// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
const playerTrail = [];
const botTrails = new Map();

runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	


	updateSkinSystem(runtime);
	updateUIText(runtime);

	
}



// ================= SKIN SYSTEM =================

const SKIN_MAX_ID = 39;
const CENTER_SKIN_SLOT = 5;

const STORAGE_UNLOCKED_SKINS = "UnlockedSkins";
const STORAGE_SELECTED_SKIN = "SelectedSkinID";
let CURRENT_LANG = "en";

const supportedLanguages = ["en","tr","ru","es","de","fr","pt","ja"];

function setGameLanguage(langCode)
{
	const lang = String(langCode || "en")
		.substring(0, 2)
		.toLowerCase();

	CURRENT_LANG = supportedLanguages.includes(lang)
		? lang
		: "en";
}

window.setGameLanguage = setGameLanguage;

// Initialize the game language from the browser language.
setGameLanguage(navigator.language || "en");

globalThis.changeTestLanguage = function(direction)
{
	const languages = ["en", "tr", "ru", "es", "de", "fr", "pt", "ja"];
	let index = languages.indexOf(CURRENT_LANG);

	index += direction;

	if (index >= languages.length)
		index = 0;

	if (index < 0)
		index = languages.length - 1;

	CURRENT_LANG = languages[index];
};


let skinSystemLoaded = false;
let equippedSkinId = 0;
let unlockedSkins = new Set([0, 1, 2, 3, 4]);
let lastUnlockedSkinId = -1;
let skinMessageTimer = 0;
let missionHintTimer = 0;
let missionHintIndex = -1;
const STORAGE_NEW_SKINS = "NewSkinIds";
let newSkinIds = new Set();

function langText(value)
{
	if (typeof value === "string")
		return value;

	if (!value)
		return "";

	return value[CURRENT_LANG] || value.en || "";
}



function updateUIText(runtime)
{
	setTextObject(runtime, "PlayText", uiText("play"));
	setTextObject(runtime, "SkinsText", uiText("skins"));
	setTextObject(runtime, "BigStartText", uiText("bigStart"));
	//setTextObject(runtime, "TextInput", uiText("enterName"));
	const nameInput = runtime.objects.TextInput?.getFirstInstance();

if (nameInput)
	nameInput.placeholder = uiText("enterName");
	setTextObject(runtime, "YouCrashedText", uiText("youCrashed"));
	setTextObject(runtime, "ReplayText", uiText("replay"));
	setTextObject(runtime, "ReviveText", uiText("revive"));
	setTextObject(
	runtime,
	"TotalPlayerScoreText",
	uiText("totalPlayerScore") +
	formatNumber(runtime.globalVars.TotalPlayerScore)
);

setTextObject(
	runtime,
	"PlayerBestScoreText",
	uiText("playerBestScore") +
	formatPowerValue(runtime.globalVars.PlayerBestScore)
);

setTextObject(
	runtime,
	"TotalFoodcountText",
	uiText("totalFoodCount") +
	formatNumber(runtime.globalVars.TotalTrashCount)
);

setTextObject(
	runtime,
	"TotalKillCountText",
	uiText("totalKillCount") +
	formatNumber(runtime.globalVars.TotalKillCount)
);

setTextObject(
	runtime,
	"TotalPlayTimeText",
	uiText("totalPlayTime") +
	formatTime(runtime.globalVars.TotalPlayTime)
);

setTextObject(
	runtime,
	"TotalMatchCountText",
	uiText("totalMatchCount") +
	formatNumber(runtime.globalVars.TotalMatchCount)
);

setTextObject(
	runtime,
	"RunKillCountText",
	uiText("runKillCount") +
	formatNumber(runtime.globalVars.RunKillCount)
);

setTextObject(
	runtime,
	"RunSurviveTimeText",
	uiText("runSurviveTime") +
	formatTime(runtime.globalVars.RunSurviveTime)
);

setTextObject(
	runtime,
	"RunFoodCountText",
	uiText("runFoodCount") +
	formatNumber(runtime.globalVars.RunTrashCount)
);
}

const UI_TEXT = {
	en: {
		use: "USE",
		play: "PLAY",
		locked: "LOCKED",
		newSkinUnlocked: "NEW SKIN UNLOCKED!",
		nextTarget: "NEXT TARGET",
		skins: "SKINS",
		bigStart: "WATCH AD-START WITH A BIG VACUUM",
		enterName: "Enter Your Name",
		youCrashed: "YOU GOT VACUUMED!",
		replay: "REPLAY",
		revive: "REVIVE",
		totalPlayerScore: "Total Score : ",
		playerBestScore: "Best Score : ",
		totalFoodCount: "Total Trash Collected : ",
		totalKillCount: "Total Vacuums Defeated : ",
		totalPlayTime: "Total Play Time : ",
		totalMatchCount: "Total Matches : ",

		runKillCount: "Vacuums Defeated : ",
		runSurviveTime: "Survival Time : ",
		runFoodCount: "Trash Collected : ",
	},

	tr: {
		use: "KULLAN",
		play: "OYNA",
		locked: "KİLİTLİ",
		newSkinUnlocked: "YENİ SKIN AÇILDI!",
		nextTarget: "SONRAKİ HEDEF",
		skins: "SKİNLER",
		bigStart: "REKLAM İZLE-BÜYÜK SÜPÜRGEYLE BAŞLA",
		enterName: "Adını Yaz",
		youCrashed: "SÜPÜRÜLDÜN!",
		replay: "TEKRAR OYNA",
		revive: "DİRİL",
		totalPlayerScore: "Toplam Skor : ",
		playerBestScore: "En İyi Skor : ",
		totalFoodCount: "Toplam Toplanan Çöp : ",
		totalKillCount: "Toplam Yok Edilen Süpürge : ",
		totalPlayTime: "Toplam Oyun Süresi : ",
		totalMatchCount: "Toplam Maç : ",

		runKillCount: "Yok Edilen Süpürge : ",
		runSurviveTime: "Hayatta Kalma Süresi : ",
		runFoodCount: "Toplanan Çöp : ",
	},

	ru: {
		use: "ВЫБРАТЬ",
		play: "ИГРАТЬ",
		locked: "ЗАКРЫТО",
		newSkinUnlocked: "НОВЫЙ СКИН ОТКРЫТ!",
		nextTarget: "СЛЕДУЮЩАЯ ЦЕЛЬ",
		skins: "СКИНЫ",
		bigStart: "СМОТРИ РЕКЛАМУ-НАЧНИ С БОЛЬШИМ ПЫЛЕСОСОМ",
		enterName: "Введите имя",
		youCrashed: "ВАС ЗАСОСАЛО!",
		replay: "СЫГРАТЬ СНОВА",
		revive: "ВОЗРОДИТЬСЯ",
		totalPlayerScore: "Общий счёт: ",
		playerBestScore: "Лучший счёт: ",
		totalFoodCount: "Всего собрано мусора: ",
		totalKillCount: "Всего уничтожено пылесосов: ",
		totalPlayTime: "Общее время игры: ",
		totalMatchCount: "Всего матчей: ",

		runKillCount: "Уничтожено пылесосов: ",
		runSurviveTime: "Время выживания: ",
		runFoodCount: "Собрано мусора: ",
	},

	es: {
	use: "USAR",
	play: "JUGAR",
	locked: "BLOQUEADO",
	newSkinUnlocked: "¡NUEVA SKIN DESBLOQUEADA!",
	nextTarget: "SIGUIENTE OBJETIVO",
	skins: "SKINS",
	bigStart: "VER ANUNCIO-EMPIEZA CON UNA ASPIRADORA GRANDE",
	enterName: "Escribe tu nombre",
	youCrashed: "¡TE HAN ASPIRADO!",
	replay: "REPETIR",
	revive: "REVIVIR",
	totalPlayerScore: "Puntuación Total : ",
	playerBestScore: "Mejor Puntuación : ",
	totalFoodCount: "Basura Recogida : ",
	totalKillCount: "Robots Aspiradores Derrotados : ",
	totalPlayTime: "Tiempo Total de Juego : ",
	totalMatchCount: "Partidas Totales : ",

	runKillCount: "Robots Aspiradores Derrotados : ",
	runSurviveTime: "Tiempo de Supervivencia : ",
	runFoodCount: "Basura Recogida : ",
},

de: {
	use: "BENUTZEN",
	play: "SPIELEN",
	locked: "GESPERRT",
	newSkinUnlocked: "NEUER SKIN FREIGESCHALTET!",
	nextTarget: "NÄCHSTES ZIEL",
	skins: "SKINS",
	bigStart: "WERBUNG ANSEHEN-MIT GROSSEM STAUBSAUGER STARTEN",
	enterName: "Name eingeben",
	youCrashed: "DU WURDEST EINGESAUGT!",
	replay: "NOCHMAL SPIELEN",
	revive: "WIEDERBELEBEN",
	totalPlayerScore: "Gesamtpunktzahl : ",
	playerBestScore: "Beste Punktzahl : ",
	totalFoodCount: "Gesammelter Müll : ",
	totalKillCount: "Besiegte Saugroboter : ",
	totalPlayTime: "Gesamtspielzeit : ",
	totalMatchCount: "Gespielte Partien : ",

	runKillCount: "Besiegte Saugroboter : ",
	runSurviveTime: "Überlebenszeit : ",
	runFoodCount: "Gesammelter Müll : ",
},

fr: {
	use: "UTILISER",
	play: "JOUER",
	locked: "VERROUILLÉ",
	newSkinUnlocked: "NOUVEAU SKIN DÉBLOQUÉ !",
	nextTarget: "OBJECTIF SUIVANT",
	skins: "SKINS",
	bigStart: "VOIR LA PUB-COMMENCE AVEC UN GRAND ASPIRATEUR",
	enterName: "Entrez votre nom",
	youCrashed: "VOUS AVEZ ÉTÉ ASPIRÉ !",
	replay: "REJOUER",
	revive: "RÉANIMER",
	totalPlayerScore: "Score Total : ",
	playerBestScore: "Meilleur Score : ",
	totalFoodCount: "Déchets Collectés : ",
	totalKillCount: "Robots Aspirateurs Éliminés : ",
	totalPlayTime: "Temps Total de Jeu : ",
	totalMatchCount: "Parties Jouées : ",

	runKillCount: "Robots Aspirateurs Éliminés : ",
	runSurviveTime: "Temps de Survie : ",
	runFoodCount: "Déchets Collectés : ",
},

pt: {
	use: "USAR",
	play: "JOGAR",
	locked: "BLOQUEADO",
	newSkinUnlocked: "NOVA SKIN DESBLOQUEADA!",
	nextTarget: "PRÓXIMO OBJETIVO",
	skins: "SKINS",
	bigStart: "VER ANÚNCIO-COMECE COM UM ASPIRADOR GRANDE",
	enterName: "Digite seu nome",
	youCrashed: "VOCÊ FOI ASPIRADO!",
	replay: "JOGAR NOVAMENTE",
	revive: "REVIVER",
	totalPlayerScore: "Pontuação Total : ",
	playerBestScore: "Melhor Pontuação : ",
	totalFoodCount: "Lixo Coletado : ",
	totalKillCount: "Robôs Aspiradores Derrotados : ",
	totalPlayTime: "Tempo Total de Jogo : ",
	totalMatchCount: "Partidas Jogadas : ",

	runKillCount: "Robôs Aspiradores Derrotados : ",
	runSurviveTime: "Tempo de Sobrevivência : ",
	runFoodCount: "Lixo Coletado : ",
},

ja: {
	use: "使用",
	play: "プレイ",
	locked: "ロック中",
	newSkinUnlocked: "新しいスキンをアンロック！",
	nextTarget: "次の目標",
	skins: "スキン",
	bigStart: "広告を見る-大きな掃除機でスタート",
	enterName: "名前を入力",
	youCrashed: "吸い込まれた！",
	replay: "もう一度",
	revive: "復活",
	totalPlayerScore: "合計スコア : ",
	playerBestScore: "ベストスコア : ",
	totalFoodCount: "集めたゴミ : ",
	totalKillCount: "倒したロボット掃除機 : ",
	totalPlayTime: "総プレイ時間 : ",
	totalMatchCount: "総プレイ回数 : ",

	runKillCount: "倒したロボット掃除機 : ",
	runSurviveTime: "生存時間 : ",
	runFoodCount: "集めたゴミ : ",
}
	
};

function uiText(key)
{
	const pack = UI_TEXT[CURRENT_LANG] || UI_TEXT.en;
	return pack[key] || UI_TEXT.en[key] || "";
}

function formatTime(seconds)
{
	seconds = Math.max(0, Math.floor(seconds));

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0)
	{
		return (
			hours + ":" +
			String(minutes).padStart(2, "0") + ":" +
			String(secs).padStart(2, "0")
		);
	}

	return (
		minutes + ":" +
		String(secs).padStart(2, "0")
	);
}

function formatNumber(value)
{
	return Math.floor(Number(value) || 0).toLocaleString(CURRENT_LANG);
}

function formatPowerValue(value)
{
	const number = Math.floor(Number(value) || 0);

	if (number < 1024)
		return String(number);

	if (number < 1048576)
		return Math.round(number / 1024) + "K";

	if (number < 1073741824)
		return Math.round(number / 1048576) + "M";

	if (number < 1099511627776)
		return Math.round(number / 1073741824) + "B";

	return Math.round(number / 1099511627776) + "T";
}

function formatMissionValue(key, value)
{
	const number = Math.max(0, Math.floor(Number(value) || 0));

	if (key === "TotalPlayTime" || key === "RunSurviveTime")
		return formatTime(number);

	if (key === "RunPlayerScore" || key === "PlayerBestScore")
		return formatPowerValue(number);

	if (number < 1000)
		return formatNumber(number);

	if (number < 1000000)
		return (Math.round(number / 100) / 10) + "K";

	if (number < 1000000000)
		return (Math.round(number / 100000) / 10) + "M";

	if (number < 1000000000000)
		return (Math.round(number / 100000000) / 10) + "B";

	return (Math.round(number / 100000000000) / 10) + "T";
}
const skinData = [


{
	id:0,
	name:{
		en:"Crumb Goblin",
		tr:"Crumb Goblin",
		ru:"Crumb Goblin",
		es:"Crumb Goblin",
		de:"Crumb Goblin",
		fr:"Crumb Goblin",
		pt:"Crumb Goblin",
		ja:"Crumb Goblin"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"A tiny cleanup hunter that vacuums every crumb before anyone notices.",
		tr:"Kimse fark etmeden tüm kırıntıları süpüren minik bir temizlik avcısı.",
		ru:"Крошечный охотник за чистотой, который собирает все крошки, пока никто не заметил.",
		es:"Un pequeño cazador de limpieza que aspira cada miga antes de que alguien la vea.",
		de:"Ein winziger Sauberkeitsjäger, der jede Krume aufsaugt, bevor sie jemand bemerkt.",
		fr:"Un petit chasseur de saletés qui aspire chaque miette avant qu'on la remarque.",
		pt:"Um pequeno caçador de limpeza que aspira cada migalha antes que alguém perceba.",
		ja:"誰かに気づかれる前に、すべての食べかすを吸い取る小さな掃除ハンター。"
	},
	mission:null
},

{
	id:1,
	name:{
		en:"Dust Bunny",
		tr:"Dust Bunny",
		ru:"Dust Bunny",
		es:"Dust Bunny",
		de:"Dust Bunny",
		fr:"Dust Bunny",
		pt:"Dust Bunny",
		ja:"Dust Bunny"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"A fluffy-looking rookie that turns dust bunnies into easy points.",
		tr:"Toz yumaklarını kolay puana çeviren pofuduk görünümlü bir çaylak.",
		ru:"Пушистый на вид новичок, превращающий комки пыли в лёгкие очки.",
		es:"Un novato de aspecto esponjoso que convierte las pelusas en puntos fáciles.",
		de:"Ein flauschig wirkender Neuling, der Staubflusen in leichte Punkte verwandelt.",
		fr:"Une recrue à l'air tout doux qui transforme les moutons de poussière en points faciles.",
		pt:"Um novato de aparência fofinha que transforma bolas de poeira em pontos fáceis.",
		ja:"ふわふわした見た目で、ほこりの塊を簡単にポイントへ変えるルーキー。"
	},
	mission:null
},

{
	id:2,
	name:{
		en:"Snack Attack",
		tr:"Snack Attack",
		ru:"Snack Attack",
		es:"Snack Attack",
		de:"Snack Attack",
		fr:"Snack Attack",
		pt:"Snack Attack",
		ja:"Snack Attack"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"It spots every abandoned bite and charges straight in for a quick cleanup.",
		tr:"Terk edilmiş her lokmayı görür ve hızlıca temizlemek için üzerine atılır.",
		ru:"Он замечает каждый брошенный кусочек и сразу мчится его убрать.",
		es:"Detecta cada bocado abandonado y se lanza directo para limpiarlo.",
		de:"Er entdeckt jeden liegen gelassenen Happen und fährt direkt hin, um ihn aufzusaugen.",
		fr:"Il repère chaque bouchée abandonnée et fonce droit dessus pour la nettoyer.",
		pt:"Detecta cada pedaço abandonado e avança direto para limpá-lo.",
		ja:"落ちている食べ物を見つけると、素早く掃除するため一直線に向かう。"
	},
	mission:null
},

{
	id:3,
	name:{
		en:"Sock Sniffer",
		tr:"Sock Sniffer",
		ru:"Sock Sniffer",
		es:"Sock Sniffer",
		de:"Sock Sniffer",
		fr:"Sock Sniffer",
		pt:"Sock Sniffer",
		ja:"Sock Sniffer"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"Finds lost socks faster than anyone would like to admit.",
		tr:"Kayıp çorapları kimsenin kabul etmek isteyeceğinden daha hızlı bulur.",
		ru:"Находит потерянные носки быстрее, чем кому-либо хотелось бы признать.",
		es:"Encuentra calcetines perdidos más rápido de lo que nadie querría admitir.",
		de:"Findet verlorene Socken schneller, als irgendjemand zugeben möchte.",
		fr:"Retrouve les chaussettes perdues plus vite que personne ne voudrait l'admettre.",
		pt:"Encontra meias perdidas mais rápido do que qualquer um gostaria de admitir.",
		ja:"誰も認めたくないほどの速さで、なくした靴下を見つけ出す。"
	},
	mission:null
},

{
	id:4,
	name:{
		en:"Ivory Pebble",
		tr:"Ivory Pebble",
		ru:"Ivory Pebble",
		es:"Ivory Pebble",
		de:"Ivory Pebble",
		fr:"Ivory Pebble",
		pt:"Ivory Pebble",
		ja:"Ivory Pebble"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"A small, calm and dependable cleaner built for smooth beginnings.",
		tr:"Rahat başlangıçlar için üretilmiş küçük, sakin ve güvenilir bir temizleyici.",
		ru:"Небольшой, спокойный и надёжный уборщик для уверенного старта.",
		es:"Un limpiador pequeño, tranquilo y fiable, creado para empezar sin sobresaltos.",
		de:"Ein kleiner, ruhiger und zuverlässiger Reiniger für einen sanften Einstieg.",
		fr:"Un petit nettoyeur calme et fiable, conçu pour débuter en douceur.",
		pt:"Um limpador pequeno, tranquilo e confiável, feito para começos suaves.",
		ja:"穏やかなスタートのために作られた、小さくて落ち着いた頼れるクリーナー。"
	},
	mission:null
},

{
	id:5,
	name:{
		en:"Snowdrop",
		tr:"Snowdrop",
		ru:"Snowdrop",
		es:"Snowdrop",
		de:"Snowdrop",
		fr:"Snowdrop",
		pt:"Snowdrop",
		ja:"Snowdrop"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"This cool-headed little unit glides quietly over every mess.",
		tr:"Soğukkanlı bu küçük model, her pisliğin üzerinden sessizce süzülür.",
		ru:"Этот хладнокровный малыш бесшумно скользит по любому беспорядку.",
		es:"Esta pequeña unidad de sangre fría se desliza en silencio sobre cualquier desastre.",
		de:"Diese kleine, kühle Einheit gleitet leise über jedes Chaos.",
		fr:"Cette petite unité au sang-froid glisse silencieusement sur tous les dégâts.",
		pt:"Esta pequena unidade de cabeça fria desliza silenciosamente sobre qualquer sujeira.",
		ja:"冷静な小型ユニットが、どんな汚れの上も静かに滑っていく。"
	},
	mission:{
		key:"RunPlayerScore",
		target:1024,
			text:{
		en:"Reach 1K power in a single match.",
		tr:"Tek oyunda 1K güce ulaş.",
		ru:"Достигните силы 1K за один матч.",
		es:"Alcanza 1K de poder en una sola partida.",
		de:"Erreiche in einem einzigen Spiel 1K Stärke.",
		fr:"Atteignez 1K de puissance en une seule partie.",
		pt:"Alcance 1K de poder em uma única partida.",
		ja:"1回のゲームでパワー1Kを達成する。"
	}
	}
},

{
	id:6,
	name:{
		en:"Bubblegum",
		tr:"Bubblegum",
		ru:"Bubblegum",
		es:"Bubblegum",
		de:"Bubblegum",
		fr:"Bubblegum",
		pt:"Bubblegum",
		ja:"Bubblegum"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"Sweet, pink and lively; it sticks with every cleanup to the end.",
		tr:"Tatlı, pembe ve enerjik; başladığı her temizliği sonuna kadar götürür.",
		ru:"Милый, розовый и бодрый; доводит каждую уборку до самого конца.",
		es:"Dulce, rosa y vivaz; se queda en cada limpieza hasta el final.",
		de:"Süß, pink und lebhaft; bleibt bei jeder Reinigung bis zum Schluss dran.",
		fr:"Doux, rose et plein d'énergie; il va au bout de chaque nettoyage.",
		pt:"Doce, rosa e animado; leva toda limpeza até o fim.",
		ja:"甘くてピンクで元気いっぱい。始めた掃除は最後までやり抜く。"
	},
	mission:{
		key:"RunKillCount",
		target:10,
		text:{
			en:"Defeat 10 vacuums in a single match.",
			tr:"Tek oyunda 10 süpürge yok et.",
			ru:"Уничтожьте 10 пылесосов за один матч.",
			es:"Derrota a 10 robots aspiradores en una sola partida.",
			de:"Besiege 10 Saugroboter in einem einzigen Spiel.",
			fr:"Éliminez 10 robots aspirateurs en une seule partie.",
			pt:"Derrote 10 robôs aspiradores em uma única partida.",
			ja:"1回のゲームでロボット掃除機を10台倒す。"
		}
	}
},

{
	id:7,
	name:{
		en:"Coral Pop",
		tr:"Coral Pop",
		ru:"Coral Pop",
		es:"Coral Pop",
		de:"Coral Pop",
		fr:"Coral Pop",
		pt:"Coral Pop",
		ja:"Coral Pop"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"A bright coral shell, cheerful motor and quick turns around small litter.",
		tr:"Parlak mercan gövde, neşeli motor ve küçük çöplerde hızlı dönüşler.",
		ru:"Яркий коралловый корпус, бодрый мотор и быстрые повороты вокруг мелкого мусора.",
		es:"Carcasa coral brillante, motor alegre y giros rápidos entre la basura pequeña.",
		de:"Leuchtende Korallenhülle, fröhlicher Motor und schnelle Kurven um kleinen Müll.",
		fr:"Coque corail éclatante, moteur joyeux et virages rapides autour des petits déchets.",
		pt:"Carcaça coral vibrante, motor alegre e curvas rápidas entre pequenos resíduos.",
		ja:"鮮やかなコーラルのボディと軽快なモーターで、小さなゴミを素早く回収する。"
	},
	mission:{
		key:"RunTrashCount",
		target:500,
		text:{
			en:"Collect 500 pieces of trash in a single match.",
			tr:"Tek oyunda 500 çöp topla.",
			ru:"Соберите 500 единиц мусора за один матч.",
			es:"Recoge 500 objetos de basura en una sola partida.",
			de:"Sammle 500 Müllteile in einem einzigen Spiel.",
			fr:"Ramassez 500 déchets en une seule partie.",
			pt:"Colete 500 itens de lixo em uma única partida.",
			ja:"1回のゲームでゴミを500個集める。"
		}
	}
},

{
	id:8,
	name:{
		en:"Frostbyte",
		tr:"Frostbyte",
		ru:"Frostbyte",
		es:"Frostbyte",
		de:"Frostbyte",
		fr:"Frostbyte",
		pt:"Frostbyte",
		ja:"Frostbyte"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"Icy blue circuits keep this little cleaner sharp under pressure.",
		tr:"Buz mavisi devreleri bu küçük temizleyiciyi baskı altında bile keskin tutar.",
		ru:"Ледяные синие схемы помогают этому малышу сохранять точность под давлением.",
		es:"Sus circuitos azul hielo mantienen a este pequeño limpiador alerta bajo presión.",
		de:"Eisblaue Schaltkreise halten diesen kleinen Reiniger auch unter Druck präzise.",
		fr:"Ses circuits bleu glacier gardent ce petit nettoyeur précis sous pression.",
		pt:"Circuitos azul-gelo mantêm este pequeno limpador afiado sob pressão.",
		ja:"氷のように青い回路が、プレッシャーの中でも小さな機体を鋭く保つ。"
	},
	mission:{
		key:"TotalMatchCount",
		target:10,
		text:{
			en:"Play 10 matches.",
			tr:"Toplam 10 maç yap.",
			ru:"Сыграйте 10 матчей.",
			es:"Juega 10 partidas.",
			de:"Spiele 10 Partien.",
			fr:"Jouez 10 parties.",
			pt:"Jogue 10 partidas.",
			ja:"合計10回プレイする。"
		}
	}
},

{
	id:9,
	name:{
		en:"Mauve Rover",
		tr:"Mauve Rover",
		ru:"Mauve Rover",
		es:"Mauve Rover",
		de:"Mauve Rover",
		fr:"Mauve Rover",
		pt:"Mauve Rover",
		ja:"Mauve Rover"
	},
	rarity:{
		en:"Common",
		tr:"Yaygın",
		ru:"Обычный",
		es:"Común",
		de:"Gewöhnlich",
		fr:"Commun",
		pt:"Comum",
		ja:"ノーマル"
	},
	desc:{
		en:"A relaxed purple explorer that never misses a dusty corner.",
		tr:"Tozlu hiçbir köşeyi kaçırmayan rahat bir mor kâşif.",
		ru:"Спокойный фиолетовый исследователь, не пропускающий ни одного пыльного угла.",
		es:"Un explorador morado y tranquilo que no se pierde ningún rincón polvoriento.",
		de:"Ein entspannter violetter Entdecker, der keine staubige Ecke übersieht.",
		fr:"Un explorateur mauve décontracté qui ne manque aucun coin poussiéreux.",
		pt:"Um explorador roxo tranquilo que não deixa passar nenhum canto empoeirado.",
		ja:"ほこりっぽい隅を決して見逃さない、のんびりした紫の探検家。"
	},
	mission:{
		key:"TotalKillCount",
		target:100,
		text:{
			en:"Defeat 100 vacuums.",
			tr:"Toplam 100 süpürge yok et.",
			ru:"Уничтожьте 100 пылесосов.",
			es:"Derrota a 100 robots aspiradores.",
			de:"Besiege 100 Saugroboter.",
			fr:"Éliminez 100 robots aspirateurs.",
			pt:"Derrote 100 robôs aspiradores.",
			ja:"ロボット掃除機を合計100台倒す。"
		}
	}
},

{
	id:10,
	name:{
		en:"Aqua Byte",
		tr:"Aqua Byte",
		ru:"Aqua Byte",
		es:"Aqua Byte",
		de:"Aqua Byte",
		fr:"Aqua Byte",
		pt:"Aqua Byte",
		ja:"Aqua Byte"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"Crisp aqua technology and smart pathfinding for rising contenders.",
		tr:"Yükselen rakipler için berrak aqua teknolojisi ve akıllı rota bulma.",
		ru:"Чёткая аква-технология и умный поиск пути для набирающих силу соперников.",
		es:"Tecnología aqua precisa y rutas inteligentes para competidores en ascenso.",
		de:"Klare Aqua-Technik und intelligente Wegfindung für aufstrebende Herausforderer.",
		fr:"Technologie aqua précise et navigation intelligente pour les concurrents prometteurs.",
		pt:"Tecnologia aqua precisa e rotas inteligentes para competidores em ascensão.",
		ja:"成長中の挑戦者に向けた、鮮明なアクア技術と賢い経路探索。"
	},
	mission:{
		key:"TotalPlayTime",
		target:1800,
		text:{
			en:"Play for a total of 30 minutes.",
			tr:"Toplam 30 dakika oyna.",
			ru:"Играйте в общей сложности 30 минут.",
			es:"Juega un total de 30 minutos.",
			de:"Spiele insgesamt 30 Minuten.",
			fr:"Jouez pendant un total de 30 minutes.",
			pt:"Jogue por um total de 30 minutos.",
			ja:"合計30分プレイする。"
		}
	}
},

{
	id:11,
	name:{
		en:"Violet Watch",
		tr:"Violet Watch",
		ru:"Violet Watch",
		es:"Violet Watch",
		de:"Violet Watch",
		fr:"Violet Watch",
		pt:"Violet Watch",
		ja:"Violet Watch"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"A patient violet sentinel that spots trouble before it spreads.",
		tr:"Sorun büyümeden fark eden sabırlı mor nöbetçi.",
		ru:"Терпеливый фиолетовый страж, замечающий угрозу до того, как она разрастётся.",
		es:"Un centinela violeta paciente que detecta el problema antes de que se extienda.",
		de:"Ein geduldiger violetter Wächter, der Ärger erkennt, bevor er sich ausbreitet.",
		fr:"Une sentinelle violette patiente qui repère le danger avant qu'il ne s'étende.",
		pt:"Um sentinela violeta paciente que percebe o problema antes que ele se espalhe.",
		ja:"トラブルが広がる前に見つける、辛抱強い紫の番人。"
	},
	mission:{
		key:"TotalTrashCount",
		target:10000,
		text:{
			en:"Collect a total of 10,000 pieces of trash.",
			tr:"Toplam 10.000 çöp topla.",
			ru:"Соберите в общей сложности 10 000 единиц мусора.",
			es:"Recoge un total de 10.000 objetos de basura.",
			de:"Sammle insgesamt 10.000 Müllteile.",
			fr:"Ramassez un total de 10 000 déchets.",
			pt:"Colete um total de 10.000 itens de lixo.",
			ja:"ゴミを合計10,000個集める。"
		}
	}
},

{
	id:12,
	name:{
		en:"Blue Comet",
		tr:"Blue Comet",
		ru:"Blue Comet",
		es:"Blue Comet",
		de:"Blue Comet",
		fr:"Blue Comet",
		pt:"Blue Comet",
		ja:"Blue Comet"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"A sleek blue speedster that leaves a clean trail behind.",
		tr:"Ardında tertemiz bir iz bırakan zarif mavi hız makinesi.",
		ru:"Стремительный синий аппарат, оставляющий за собой идеально чистый след.",
		es:"Un veloz modelo azul que deja un rastro impecable a su paso.",
		de:"Ein eleganter blauer Flitzer, der eine saubere Spur hinterlässt.",
		fr:"Un bolide bleu élégant qui laisse une piste impeccable derrière lui.",
		pt:"Um veloz modelo azul que deixa um rastro impecável para trás.",
		ja:"通った跡をきれいに磨き上げる、流線型の青いスピードスター。"
	},
	mission:{
		key:"TotalPlayTime",
		target:3600,
		text:{
			en:"Play for a total of 1 hour.",
			tr:"Toplamda 1 saat oyun oyna.",
			ru:"Играйте в общей сложности 1 час.",
			es:"Juega durante un total de 1 hora.",
			de:"Spiele insgesamt 1 Stunde.",
			fr:"Jouez pendant un total de 1 heure.",
			pt:"Jogue por um total de 1 hora.",
			ja:"合計1時間プレイする。"
		}
	}
},

{
	id:13,
	name:{
		en:"Pizza Patrol",
		tr:"Pizza Patrol",
		ru:"Pizza Patrol",
		es:"Pizza Patrol",
		de:"Pizza Patrol",
		fr:"Pizza Patrol",
		pt:"Pizza Patrol",
		ja:"Pizza Patrol"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"It follows the scent of cheese straight to the next target.",
		tr:"Peynir kokusunu takip ederek doğruca sonraki hedefe gider.",
		ru:"Следует за запахом сыра прямо к следующей цели.",
		es:"Sigue el aroma del queso directamente hasta el siguiente objetivo.",
		de:"Folgt dem Duft von Käse direkt zum nächsten Ziel.",
		fr:"Suit l'odeur du fromage tout droit jusqu'à la prochaine cible.",
		pt:"Segue o cheiro de queijo direto até o próximo alvo.",
		ja:"チーズの香りを追い、次のターゲットへ一直線に向かう。"
	},
	mission:{
		key:"TotalPlayerScore",
		target:100000,
		text:{
			en:"Reach a total score of 100,000.",
			tr:"Toplamda 100.000 skor yap.",
			ru:"Наберите в общей сложности 100 000 очков.",
			es:"Consigue un total de 100.000 puntos.",
			de:"Erreiche insgesamt 100.000 Punkte.",
			fr:"Atteins un score total de 100 000 points.",
			pt:"Alcance um total de 100.000 pontos.",
			ja:"合計100,000スコアを達成する。"
		}
	}
},

{
	id:14,
	name:{
		en:"Night Owl",
		tr:"Night Owl",
		ru:"Night Owl",
		es:"Night Owl",
		de:"Night Owl",
		fr:"Night Owl",
		pt:"Night Owl",
		ja:"Night Owl"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"A quiet dark hunter that works best when the arena gets crowded.",
		tr:"Arena kalabalıklaştığında en iyi çalışan sessiz karanlık avcı.",
		ru:"Тихий тёмный охотник, который особенно силён в переполненной арене.",
		es:"Un cazador oscuro y silencioso que rinde mejor cuando la arena se llena.",
		de:"Ein stiller dunkler Jäger, der in einer vollen Arena am besten arbeitet.",
		fr:"Un chasseur sombre et silencieux qui excelle quand l'arène se remplit.",
		pt:"Um caçador escuro e silencioso que rende melhor quando a arena fica cheia.",
		ja:"アリーナが混み合うほど力を発揮する、静かな闇のハンター。"
	},
	mission:{
		key:"TotalKillCount",
		target:400,
		text:{
			en:"Defeat 400 vacuums.",
			tr:"Toplam 400 süpürge yok et.",
			ru:"Уничтожьте 400 пылесосов.",
			es:"Derrota a 400 robots aspiradores.",
			de:"Besiege 400 Saugroboter.",
			fr:"Éliminez 400 robots aspirateurs.",
			pt:"Derrote 400 robôs aspiradores.",
			ja:"ロボット掃除機を合計400台倒す。"
		}
	}
},

{
	id:15,
	name:{
		en:"Turbo Tangerine",
		tr:"Turbo Tangerine",
		ru:"Turbo Tangerine",
		es:"Turbo Tangerine",
		de:"Turbo Tangerine",
		fr:"Turbo Tangerine",
		pt:"Turbo Tangerine",
		ja:"Turbo Tangerine"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"An orange turbo shell made for daring bursts and sharp turns.",
		tr:"Cesur hız patlamaları ve keskin dönüşler için tasarlanmış turuncu turbo gövde.",
		ru:"Оранжевый турбокорпус для смелых рывков и резких поворотов.",
		es:"Una carcasa turbo naranja hecha para acelerones audaces y giros cerrados.",
		de:"Eine orangefarbene Turbohülle für mutige Sprints und scharfe Kurven.",
		fr:"Une coque turbo orange conçue pour des accélérations osées et des virages serrés.",
		pt:"Uma carcaça turbo laranja feita para arrancadas ousadas e curvas fechadas.",
		ja:"大胆な加速と鋭いターンのために作られた、オレンジ色のターボボディ。"
	},
	mission:{
		key:"TotalTrashCount",
		target:20000,
		text:{
			en:"Collect a total of 20,000 pieces of trash.",
			tr:"Toplam 20.000 çöp topla.",
			ru:"Соберите в общей сложности 20 000 единиц мусора.",
			es:"Recoge un total de 20.000 objetos de basura.",
			de:"Sammle insgesamt 20.000 Müllteile.",
			fr:"Ramassez un total de 20 000 déchets.",
			pt:"Colete um total de 20.000 itens de lixo.",
			ja:"ゴミを合計20,000個集める。"
		}
	}
},

{
	id:16,
	name:{
		en:"Solar Flare",
		tr:"Solar Flare",
		ru:"Solar Flare",
		es:"Solar Flare",
		de:"Solar Flare",
		fr:"Solar Flare",
		pt:"Solar Flare",
		ja:"Solar Flare"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"Golden energy and a bright temper packed into one fast cleaner.",
		tr:"Tek bir hızlı temizleyicide altın enerji ve parlak bir öfke.",
		ru:"Золотая энергия и яркий характер в одном быстром уборщике.",
		es:"Energía dorada y carácter brillante reunidos en un limpiador veloz.",
		de:"Goldene Energie und feuriges Temperament in einem schnellen Reiniger.",
		fr:"Énergie dorée et tempérament éclatant réunis dans un nettoyeur rapide.",
		pt:"Energia dourada e temperamento intenso reunidos em um limpador veloz.",
		ja:"黄金のエネルギーと熱い気質を備えた、高速クリーナー。"
	},
	mission:{
		key:"TotalMatchCount",
		target:50,
		text:{
			en:"Play 50 matches.",
			tr:"Toplam 50 maç yap.",
			ru:"Сыграйте 50 матчей.",
			es:"Juega 50 partidas.",
			de:"Spiele 50 Partien.",
			fr:"Jouez 50 parties.",
			pt:"Jogue 50 partidas.",
			ja:"合計50回プレイする。"
		}
	}
},

{
	id:17,
	name:{
		en:"Phantom Violet",
		tr:"Phantom Violet",
		ru:"Phantom Violet",
		es:"Phantom Violet",
		de:"Phantom Violet",
		fr:"Phantom Violet",
		pt:"Phantom Violet",
		ja:"Phantom Violet"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"It slips through the chaos and strikes from an unexpected angle.",
		tr:"Karmaşanın içinden kayar ve beklenmedik bir açıdan saldırır.",
		ru:"Проскальзывает сквозь хаос и атакует с неожиданного направления.",
		es:"Se desliza entre el caos y ataca desde un ángulo inesperado.",
		de:"Gleitet durch das Chaos und schlägt aus einem unerwarteten Winkel zu.",
		fr:"Se faufile dans le chaos et frappe depuis un angle inattendu.",
		pt:"Desliza pelo caos e ataca de um ângulo inesperado.",
		ja:"混乱の中をすり抜け、予想外の角度から仕掛ける。"
	},
	mission:{
		key:"TotalPlayerScore",
		target:150000,
		text:{
			en:"Reach a total score of 150,000.",
			tr:"Toplamda 150.000 skor yap.",
			ru:"Наберите в общей сложности 150 000 очков.",
			es:"Consigue un total de 150.000 puntos.",
			de:"Erreiche insgesamt 150.000 Punkte.",
			fr:"Atteins un score total de 150 000 points.",
			pt:"Alcance um total de 150.000 pontos.",
			ja:"合計150,000スコアを達成する。"
		}
	}
},

{
	id:18,
	name:{
		en:"Silverstream",
		tr:"Silverstream",
		ru:"Silverstream",
		es:"Silverstream",
		de:"Silverstream",
		fr:"Silverstream",
		pt:"Silverstream",
		ja:"Silverstream"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"A smooth silver chassis built for clean lines and steady momentum.",
		tr:"Temiz çizgiler ve istikrarlı ivme için üretilmiş pürüzsüz gümüş şasi.",
		ru:"Гладкое серебристое шасси для чистых траекторий и стабильного разгона.",
		es:"Un chasis plateado y suave, creado para trayectorias limpias y ritmo constante.",
		de:"Ein glattes silbernes Chassis für saubere Linien und gleichmäßigen Schwung.",
		fr:"Un châssis argenté fluide, conçu pour des trajectoires nettes et un élan constant.",
		pt:"Um chassi prateado suave, feito para linhas limpas e impulso constante.",
		ja:"きれいなラインと安定した加速のために作られた、滑らかな銀色シャーシ。"
	},
	mission:{
		key:"TotalPlayTime",
		target:7200,
		text:{
			en:"Play for a total of 2 hours.",
			tr:"Toplamda 2 saat oyun oyna.",
			ru:"Играйте в общей сложности 2 часа.",
			es:"Juega durante un total de 2 horas.",
			de:"Spiele insgesamt 2 Stunden.",
			fr:"Jouez pendant un total de 2 heures.",
			pt:"Jogue por um total de 2 horas.",
			ja:"合計2時間プレイする。"
		}
	}
},

{
	id:19,
	name:{
		en:"Iron Biscuit",
		tr:"Iron Biscuit",
		ru:"Iron Biscuit",
		es:"Iron Biscuit",
		de:"Iron Biscuit",
		fr:"Iron Biscuit",
		pt:"Iron Biscuit",
		ja:"Iron Biscuit"
	},
	rarity:{
		en:"Rare",
		tr:"Nadir",
		ru:"Редкий",
		es:"Raro",
		de:"Selten",
		fr:"Rare",
		pt:"Raro",
		ja:"レア"
	},
	desc:{
		en:"Tough as a bolt, shaped like a snack and impossible to underestimate.",
		tr:"Bir cıvata kadar sağlam, bisküvi gibi yuvarlak ve hafife alınamaz.",
		ru:"Крепкий как болт, круглый как печенье — его нельзя недооценивать.",
		es:"Duro como un tornillo, redondo como una galleta e imposible de subestimar.",
		de:"Hart wie eine Schraube, rund wie ein Keks und unmöglich zu unterschätzen.",
		fr:"Solide comme un boulon, rond comme un biscuit et impossible à sous-estimer.",
		pt:"Duro como um parafuso, redondo como um biscoito e impossível de subestimar.",
		ja:"ボルトのように頑丈で、お菓子のように丸い。侮ることはできない。"
	},
	mission:{
		key:"TotalKillCount",
		target:800,
		text:{
			en:"Defeat 800 vacuums.",
			tr:"Toplam 800 süpürge yok et.",
			ru:"Уничтожьте в общей сложности 800 пылесосов.",
			es:"Derrota a 800 robots aspiradores.",
			de:"Besiege insgesamt 800 Saugroboter.",
			fr:"Éliminez un total de 800 robots aspirateurs.",
			pt:"Derrote um total de 800 robôs aspiradores.",
			ja:"ロボット掃除機を合計800台倒す。"
		}
	}
},

{
	id:20,
	name:{
		en:"Gold Circuit",
		tr:"Gold Circuit",
		ru:"Gold Circuit",
		es:"Gold Circuit",
		de:"Gold Circuit",
		fr:"Gold Circuit",
		pt:"Gold Circuit",
		ja:"Gold Circuit"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Precision graphite armor powered by premium golden circuitry.",
		tr:"Üst sınıf altın devrelerle çalışan hassas grafit zırh.",
		ru:"Точная графитовая броня, питаемая первоклассными золотыми схемами.",
		es:"Armadura de grafito precisa, impulsada por circuitos dorados de primera clase.",
		de:"Präzise Graphitpanzerung mit erstklassigen goldenen Schaltkreisen.",
		fr:"Armure de graphite précise, alimentée par des circuits dorés haut de gamme.",
		pt:"Armadura de grafite precisa, alimentada por circuitos dourados premium.",
		ja:"最高級の金色回路で駆動する、精密なグラファイト装甲。"
	},
	mission:{
		key:"TotalMatchCount",
		target:100,
		text:{
			en:"Play 100 matches.",
			tr:"Toplam 100 maç yap.",
			ru:"Сыграйте 100 матчей.",
			es:"Juega 100 partidas.",
			de:"Spiele 100 Partien.",
			fr:"Jouez 100 parties.",
			pt:"Jogue 100 partidas.",
			ja:"合計100回プレイする。"
		}
	}
},

{
	id:21,
	name:{
		en:"Teal Bastion",
		tr:"Teal Bastion",
		ru:"Teal Bastion",
		es:"Teal Bastion",
		de:"Teal Bastion",
		fr:"Teal Bastion",
		pt:"Teal Bastion",
		ja:"Teal Bastion"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Reinforced teal plating turns this cleaner into a moving fortress.",
		tr:"Güçlendirilmiş turkuaz kaplama bu temizleyiciyi hareketli bir kaleye çevirir.",
		ru:"Усиленная бирюзовая обшивка превращает этот уборщик в движущуюся крепость.",
		es:"El blindaje turquesa reforzado convierte a este limpiador en una fortaleza móvil.",
		de:"Verstärkte petrolfarbene Panzerung macht diesen Reiniger zur fahrenden Festung.",
		fr:"Le blindage sarcelle renforcé transforme ce nettoyeur en forteresse mobile.",
		pt:"A blindagem verde-azulada reforçada transforma este limpador em uma fortaleza móvel.",
		ja:"強化された青緑の装甲が、このクリーナーを動く要塞へ変える。"
	},
	mission:{
		key:"TotalPlayerScore",
		target:200000,
		text:{
			en:"Reach a total score of 200,000.",
			tr:"Toplam 200.000 skor yap.",
			ru:"Наберите в общей сложности 200 000 очков.",
			es:"Consigue un total de 200.000 puntos.",
			de:"Erreiche insgesamt 200.000 Punkte.",
			fr:"Atteins un score total de 200 000 points.",
			pt:"Alcance um total de 200.000 pontos.",
			ja:"合計200,000スコアを達成する。"
		}
	}
},

{
	id:22,
	name:{
		en:"OctoCore",
		tr:"OctoCore",
		ru:"OctoCore",
		es:"OctoCore",
		de:"OctoCore",
		fr:"OctoCore",
		pt:"OctoCore",
		ja:"OctoCore"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Its eight-sided core balances control, defense and raw suction.",
		tr:"Sekizgen çekirdeği kontrol, savunma ve ham emiş gücünü dengeler.",
		ru:"Восьмигранное ядро сочетает управление, защиту и чистую силу всасывания.",
		es:"Su núcleo octogonal equilibra control, defensa y potencia de succión pura.",
		de:"Sein achtseitiger Kern vereint Kontrolle, Verteidigung und rohe Saugkraft.",
		fr:"Son noyau octogonal équilibre contrôle, défense et puissance d'aspiration brute.",
		pt:"Seu núcleo octogonal equilibra controle, defesa e força bruta de sucção.",
		ja:"八角形のコアが、制御、防御、そして純粋な吸引力を両立する。"
	},
	mission:{
		key:"TotalTrashCount",
		target:30000,
		text:{
			en:"Collect a total of 30,000 pieces of trash.",
			tr:"Toplam 30.000 çöp topla.",
			ru:"Соберите в общей сложности 30 000 единиц мусора.",
			es:"Recoge un total de 30.000 objetos de basura.",
			de:"Sammle insgesamt 30.000 Müllteile.",
			fr:"Ramassez un total de 30 000 déchets.",
			pt:"Colete um total de 30.000 itens de lixo.",
			ja:"ゴミを合計30,000個集める。"
		}
	}
},

{
	id:23,
	name:{
		en:"Amethyst Pulse",
		tr:"Amethyst Pulse",
		ru:"Amethyst Pulse",
		es:"Amethyst Pulse",
		de:"Amethyst Pulse",
		fr:"Amethyst Pulse",
		pt:"Amethyst Pulse",
		ja:"Amethyst Pulse"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Purple energy pulses through every panel when prey is near.",
		tr:"Av yaklaştığında mor enerji her panelde nabız gibi atar.",
		ru:"Когда добыча близко, фиолетовая энергия пульсирует в каждой панели.",
		es:"La energía violeta pulsa por cada panel cuando la presa está cerca.",
		de:"Violette Energie pulsiert durch jede Platte, sobald Beute in der Nähe ist.",
		fr:"Une énergie violette pulse dans chaque panneau lorsque la proie approche.",
		pt:"Energia violeta pulsa por cada painel quando a presa está perto.",
		ja:"獲物が近づくと、紫のエネルギーが全パネルを脈打つ。"
	},
	mission:{
		key:"TotalPlayTime",
		target:10800,
		text:{
			en:"Play for a total of 3 hours.",
			tr:"Toplamda 3 saat oyna.",
			ru:"Играйте в общей сложности 3 часа.",
			es:"Juega durante un total de 3 horas.",
			de:"Spiele insgesamt 3 Stunden.",
			fr:"Jouez pendant un total de 3 heures.",
			pt:"Jogue por um total de 3 horas.",
			ja:"合計3時間プレイする。"
		}
	}
},

{
	id:24,
	name:{
		en:"Violet Vector",
		tr:"Violet Vector",
		ru:"Violet Vector",
		es:"Violet Vector",
		de:"Violet Vector",
		fr:"Violet Vector",
		pt:"Violet Vector",
		ja:"Violet Vector"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"It calculates the shortest route, then takes it at full speed.",
		tr:"En kısa rotayı hesaplar, sonra tam hızla uygular.",
		ru:"Вычисляет кратчайший маршрут, а затем проходит его на полной скорости.",
		es:"Calcula la ruta más corta y luego la recorre a toda velocidad.",
		de:"Berechnet den kürzesten Weg und nimmt ihn dann mit Höchstgeschwindigkeit.",
		fr:"Calcule le trajet le plus court, puis l'emprunte à pleine vitesse.",
		pt:"Calcula a rota mais curta e depois a percorre em velocidade máxima.",
		ja:"最短ルートを計算し、そのまま最高速度で駆け抜ける。"
	},
	mission:{
		key:"TotalKillCount",
		target:1200,
		text:{
			en:"Defeat a total of 1,200 vacuums.",
			tr:"Toplam 1.200 süpürge yok et.",
			ru:"Уничтожьте в общей сложности 1 200 пылесосов.",
			es:"Derrota un total de 1.200 robots aspiradores.",
			de:"Besiege insgesamt 1.200 Saugroboter.",
			fr:"Éliminez un total de 1 200 robots aspirateurs.",
			pt:"Derrote um total de 1.200 robôs aspiradores.",
			ja:"ロボット掃除機を合計1,200台倒す。"
		}
	}
},

{
	id:25,
	name:{
		en:"Copper Coil",
		tr:"Copper Coil",
		ru:"Copper Coil",
		es:"Copper Coil",
		de:"Copper Coil",
		fr:"Copper Coil",
		pt:"Copper Coil",
		ja:"Copper Coil"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Hot copper coils deliver reliable power without wasting a spark.",
		tr:"Sıcak bakır bobinler tek kıvılcımı bile boşa harcamadan güvenilir güç verir.",
		ru:"Горячие медные катушки дают надёжную мощность, не теряя ни одной искры.",
		es:"Sus bobinas de cobre entregan potencia fiable sin desperdiciar una sola chispa.",
		de:"Heiße Kupferspulen liefern zuverlässige Leistung, ohne einen Funken zu verschwenden.",
		fr:"Des bobines de cuivre brûlantes fournissent une puissance fiable sans perdre une étincelle.",
		pt:"Bobinas de cobre quentes fornecem potência confiável sem desperdiçar uma faísca.",
		ja:"熱い銅製コイルが、火花ひとつ無駄にせず安定した力を供給する。"
	},
	mission:{
	key:"PlayerBestScore",
	target:16384,
	text:{
		en:"Reach a Best Score of 16K.",
		tr:"En iyi skor olarak 16K'ya ulaş.",
		ru:"Достигните лучшего результата в 16K.",
		es:"Alcanza un mejor puntaje de 16K.",
		de:"Erreiche einen Bestwert von 16K.",
		fr:"Atteignez un meilleur score de 16K.",
		pt:"Alcance uma melhor pontuação de 16K.",
		ja:"ベストスコア16Kを達成する。"
	}
}
},

{
	id:26,
	name:{
		en:"Midnight Halo",
		tr:"Midnight Halo",
		ru:"Midnight Halo",
		es:"Midnight Halo",
		de:"Midnight Halo",
		fr:"Midnight Halo",
		pt:"Midnight Halo",
		ja:"Midnight Halo"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Dark armor and a cyan halo mark an elite arena stalker.",
		tr:"Koyu zırhı ve camgöbeği halesi elit bir arena avcısını işaret eder.",
		ru:"Тёмная броня и бирюзовый ореол выдают элитного охотника арены.",
		es:"La armadura oscura y un halo cian distinguen a un cazador de élite.",
		de:"Dunkle Panzerung und ein cyanfarbener Halo kennzeichnen einen Elitejäger der Arena.",
		fr:"Une armure sombre et un halo cyan signalent un traqueur d'élite de l'arène.",
		pt:"Armadura escura e um halo ciano marcam um caçador de elite da arena.",
		ja:"暗い装甲とシアンの光輪が、エリート級のアリーナハンターを示す。"
	},
	mission:{
		key:"TotalMatchCount",
		target:150,
		text:{
			en:"Play 150 matches.",
			tr:"Toplam 150 maç yap.",
			ru:"Сыграйте 150 матчей.",
			es:"Juega 150 partidas.",
			de:"Spiele 150 Partien.",
			fr:"Jouez 150 parties.",
			pt:"Jogue 150 partidas.",
			ja:"合計150回プレイする。"
		}
	}
},

{
	id:27,
	name:{
		en:"Cobalt Ranger",
		tr:"Cobalt Ranger",
		ru:"Cobalt Ranger",
		es:"Cobalt Ranger",
		de:"Cobalt Ranger",
		fr:"Cobalt Ranger",
		pt:"Cobalt Ranger",
		ja:"Cobalt Ranger"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Long-range sensors track litter and smaller rivals alike.",
		tr:"Uzun menzilli sensörleri hem çöpleri hem de küçük rakipleri izler.",
		ru:"Дальние сенсоры одинаково хорошо отслеживают мусор и более мелких соперников.",
		es:"Sus sensores de largo alcance rastrean tanto basura como rivales más pequeños.",
		de:"Langstreckensensoren verfolgen sowohl Müll als auch kleinere Rivalen.",
		fr:"Ses capteurs longue portée suivent aussi bien les déchets que les petits rivaux.",
		pt:"Sensores de longo alcance rastreiam tanto lixo quanto rivais menores.",
		ja:"長距離センサーが、ゴミも小さなライバルも逃さず追跡する。"
	},
	mission:{
		key:"TotalPlayerScore",
		target:300000,
		text:{
			en:"Reach a total score of 300,000.",
			tr:"Toplamda 300.000 skor yap.",
			ru:"Наберите в общей сложности 300 000 очков.",
			es:"Consigue un total de 300.000 puntos.",
			de:"Erreiche insgesamt 300.000 Punkte.",
			fr:"Atteins un score total de 300 000 points.",
			pt:"Alcance um total de 300.000 pontos.",
			ja:"合計300,000スコアを達成する。"
		}
	}
},

{
	id:28,
	name:{
		en:"Lidar Lynx",
		tr:"Lidar Lynx",
		ru:"Lidar Lynx",
		es:"Lidar Lynx",
		de:"Lidar Lynx",
		fr:"Lidar Lynx",
		pt:"Lidar Lynx",
		ja:"Lidar Lynx"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Sharp lidar scans make this blue hunter almost impossible to surprise.",
		tr:"Keskin lidar taramaları bu mavi avcıyı hazırlıksız yakalamayı neredeyse imkânsız kılar.",
		ru:"Точное лидарное сканирование делает этого синего охотника почти неуязвимым для сюрпризов.",
		es:"Sus precisos escaneos lidar hacen casi imposible sorprender a este cazador azul.",
		de:"Scharfe Lidar-Scans machen es fast unmöglich, diesen blauen Jäger zu überraschen.",
		fr:"Ses scans lidar précis rendent ce chasseur bleu presque impossible à surprendre.",
		pt:"Varreduras lidar precisas tornam este caçador azul quase impossível de surpreender.",
		ja:"鋭いLIDARスキャンにより、この青いハンターを奇襲するのはほぼ不可能。"
	},
	mission:{
		key:"TotalTrashCount",
		target:40000,
		text:{
			en:"Collect a total of 40,000 pieces of trash.",
			tr:"Toplam 40.000 çöp topla.",
			ru:"Соберите в общей сложности 40 000 единиц мусора.",
			es:"Recoge un total de 40.000 objetos de basura.",
			de:"Sammle insgesamt 40.000 Müllteile.",
			fr:"Ramassez un total de 40 000 déchets.",
			pt:"Colete um total de 40.000 itens de lixo.",
			ja:"ゴミを合計40,000個集める。"
		}
	}
},

{
	id:29,
	name:{
		en:"Blackout",
		tr:"Blackout",
		ru:"Blackout",
		es:"Blackout",
		de:"Blackout",
		fr:"Blackout",
		pt:"Blackout",
		ja:"Blackout"
	},
	rarity:{
		en:"Epic",
		tr:"Destansı",
		ru:"Эпический",
		es:"Épico",
		de:"Episch",
		fr:"Épique",
		pt:"Épico",
		ja:"エピック"
	},
	desc:{
		en:"Silent matte armor vanishes into dark floors before the attack.",
		tr:"Sessiz mat zırhı saldırıdan önce karanlık zeminde kaybolur.",
		ru:"Бесшумная матовая броня растворяется на тёмном полу перед атакой.",
		es:"Su armadura mate y silenciosa desaparece en los suelos oscuros antes del ataque.",
		de:"Die lautlose matte Panzerung verschwindet vor dem Angriff auf dunklen Böden.",
		fr:"Son armure mate et silencieuse disparaît sur les sols sombres avant l'attaque.",
		pt:"A armadura fosca e silenciosa desaparece em pisos escuros antes do ataque.",
		ja:"静かなマット装甲が、攻撃直前に暗い床へ溶け込む。"
	},
	mission:{
		key:"TotalPlayTime",
		target:14400,
		text:{
			en:"Play for a total of 4 hours.",
			tr:"Toplamda 4 saat oyun oyna.",
			ru:"Играйте в общей сложности 4 часа.",
			es:"Juega durante un total de 4 horas.",
			de:"Spiele insgesamt 4 Stunden.",
			fr:"Jouez pendant un total de 4 heures.",
			pt:"Jogue por um total de 4 horas.",
			ja:"合計4時間プレイする。"
		}
	}
},

{
	id:30,
	name:{
		en:"Arctic Titan",
		tr:"Arctic Titan",
		ru:"Arctic Titan",
		es:"Arctic Titan",
		de:"Arctic Titan",
		fr:"Arctic Titan",
		pt:"Arctic Titan",
		ja:"Arctic Titan"
	},
	rarity:{
		en:"Legendary",
		tr:"Efsanevi",
		ru:"Легендарный",
		es:"Legendario",
		de:"Legendär",
		fr:"Légendaire",
		pt:"Lendário",
		ja:"レジェンダリー"
	},
	desc:{
		en:"Heavy arctic plating stays cool while crushing through crowded lanes.",
		tr:"Ağır kutup zırhı, kalabalık koridorları ezerken bile serin kalır.",
		ru:"Тяжёлая арктическая броня сохраняет холод, пробивая путь через толпу.",
		es:"Su pesada armadura ártica se mantiene fría mientras atraviesa carriles abarrotados.",
		de:"Schwere arktische Panzerung bleibt kühl, während sie sich durch volle Bahnen kämpft.",
		fr:"Son lourd blindage arctique reste froid en écrasant les couloirs bondés.",
		pt:"A pesada blindagem ártica permanece fria enquanto atravessa corredores lotados.",
		ja:"重い極地装甲は、混雑した進路を押し切る間も冷静さを保つ。"
	},
	mission:{
	key:"PlayerBestScore",
	target:32768,
	text:{
		en:"Reach a Best Score of 32K.",
		tr:"En iyi skor olarak 32K'ya ulaş.",
		ru:"Достигните лучшего результата в 32K.",
		es:"Alcanza un mejor puntaje de 32K.",
		de:"Erreiche einen Bestwert von 32K.",
		fr:"Atteignez un meilleur score de 32K.",
		pt:"Alcance uma melhor pontuação de 32K.",
		ja:"ベストスコア32Kを達成する。"
	}
}
},

{
	id:31,
	name:{
		en:"Ember Juggernaut",
		tr:"Ember Juggernaut",
		ru:"Ember Juggernaut",
		es:"Ember Juggernaut",
		de:"Ember Juggernaut",
		fr:"Ember Juggernaut",
		pt:"Ember Juggernaut",
		ja:"Ember Juggernaut"
	},
	rarity:{
		en:"Legendary",
		tr:"Efsanevi",
		ru:"Легендарный",
		es:"Legendario",
		de:"Legendär",
		fr:"Légendaire",
		pt:"Lendário",
		ja:"レジェンダリー"
	},
	desc:{
		en:"Red-hot armor and relentless torque, built to break through.",
		tr:"Kızgın zırh ve durmak bilmeyen tork; engelleri yarmak için üretildi.",
		ru:"Раскалённая броня и неумолимый крутящий момент созданы для прорыва.",
		es:"Armadura al rojo vivo y par implacable, creados para abrirse paso.",
		de:"Glühende Panzerung und unerbittliches Drehmoment, gebaut für den Durchbruch.",
		fr:"Armure chauffée à blanc et couple implacable, conçus pour percer.",
		pt:"Armadura incandescente e torque implacável, feitos para abrir caminho.",
		ja:"赤熱する装甲と止まらないトルク。突破するために作られた。"
	},
	mission:{
		key:"TotalPlayTime",
		target:21600,
		text:{
			en:"Play for a total of 6 hours.",
			tr:"Toplam 6 saat oyna.",
			ru:"Играйте в общей сложности 6 часов.",
			es:"Juega durante un total de 6 horas.",
			de:"Spiele insgesamt 6 Stunden.",
			fr:"Jouez pendant un total de 6 heures.",
			pt:"Jogue por um total de 6 horas.",
			ja:"合計6時間プレイする。"
		}
	}
},

{
	id:32,
	name:{
		en:"Nebula Crusher",
		tr:"Nebula Crusher",
		ru:"Nebula Crusher",
		es:"Nebula Crusher",
		de:"Nebula Crusher",
		fr:"Nebula Crusher",
		pt:"Nebula Crusher",
		ja:"Nebula Crusher"
	},
	rarity:{
		en:"Legendary",
		tr:"Efsanevi",
		ru:"Легендарный",
		es:"Legendario",
		de:"Legendär",
		fr:"Légendaire",
		pt:"Lendário",
		ja:"レジェンダリー"
	},
	desc:{
		en:"Its cosmic purple reactor turns every collision into a statement.",
		tr:"Kozmik mor reaktörü her çarpışmayı güçlü bir mesaja dönüştürür.",
		ru:"Космический фиолетовый реактор превращает каждое столкновение в громкое заявление.",
		es:"Su reactor púrpura cósmico convierte cada choque en toda una declaración.",
		de:"Sein kosmischer violetter Reaktor macht jede Kollision zu einer Ansage.",
		fr:"Son réacteur violet cosmique transforme chaque collision en démonstration de force.",
		pt:"Seu reator roxo cósmico transforma cada colisão em uma demonstração de força.",
		ja:"宇宙の紫色リアクターが、すべての衝突を力の証明へ変える。"
	},
	mission:{
		key:"TotalKillCount",
		target:1400,
		text:{
			en:"Defeat a total of 1,400 vacuums.",
			tr:"Toplam 1.400 süpürge yok et.",
			ru:"Уничтожьте в общей сложности 1 400 пылесосов.",
			es:"Derrota un total de 1.400 robots aspiradores.",
			de:"Besiege insgesamt 1.400 Saugroboter.",
			fr:"Éliminez un total de 1 400 robots aspirateurs.",
			pt:"Derrote um total de 1.400 robôs aspiradores.",
			ja:"ロボット掃除機を合計1,400台倒す。"
		}
	}
},

{
	id:33,
	name:{
		en:"Azure Reactor",
		tr:"Azure Reactor",
		ru:"Azure Reactor",
		es:"Azure Reactor",
		de:"Azure Reactor",
		fr:"Azure Reactor",
		pt:"Azure Reactor",
		ja:"Azure Reactor"
	},
	rarity:{
		en:"Legendary",
		tr:"Efsanevi",
		ru:"Легендарный",
		es:"Legendario",
		de:"Legendär",
		fr:"Légendaire",
		pt:"Lendário",
		ja:"レジェンダリー"
	},
	desc:{
		en:"A high-output blue core feeds industrial-grade suction power.",
		tr:"Yüksek çıkışlı mavi çekirdeği endüstriyel emiş gücü sağlar.",
		ru:"Мощное синее ядро питает всасывание промышленного уровня.",
		es:"Un núcleo azul de alto rendimiento alimenta una succión de nivel industrial.",
		de:"Ein leistungsstarker blauer Kern speist Saugkraft in Industriequalität.",
		fr:"Un noyau bleu à haut rendement alimente une aspiration de niveau industriel.",
		pt:"Um núcleo azul de alta potência alimenta sucção de nível industrial.",
		ja:"高出力の青いコアが、工業レベルの吸引力を供給する。"
	},
	mission:{
		key:"TotalPlayTime",
		target:28800,
		text:{
			en:"Play for a total of 8 hours.",
			tr:"Toplamda 8 saat oyun oyna.",
			ru:"Играйте в общей сложности 8 часов.",
			es:"Juega durante un total de 8 horas.",
			de:"Spiele insgesamt 8 Stunden.",
			fr:"Jouez pendant un total de 8 heures.",
			pt:"Jogue por um total de 8 horas.",
			ja:"合計8時間プレイする。"
		}
	}
},

{
	id:34,
	name:{
		en:"Crimson Ronin",
		tr:"Crimson Ronin",
		ru:"Crimson Ronin",
		es:"Crimson Ronin",
		de:"Crimson Ronin",
		fr:"Crimson Ronin",
		pt:"Crimson Ronin",
		ja:"Crimson Ronin"
	},
	rarity:{
		en:"Legendary",
		tr:"Efsanevi",
		ru:"Легендарный",
		es:"Legendario",
		de:"Legendär",
		fr:"Légendaire",
		pt:"Lendário",
		ja:"レジェンダリー"
	},
	desc:{
		en:"A disciplined red warrior that waits for one perfect opening.",
		tr:"Tek kusursuz fırsatı sabırla bekleyen disiplinli kırmızı savaşçı.",
		ru:"Дисциплинированный красный воин, терпеливо ждущий идеального момента.",
		es:"Un guerrero rojo disciplinado que espera una única apertura perfecta.",
		de:"Ein disziplinierter roter Krieger, der auf die eine perfekte Gelegenheit wartet.",
		fr:"Un guerrier rouge discipliné qui attend l'ouverture parfaite.",
		pt:"Um guerreiro vermelho disciplinado que espera a oportunidade perfeita.",
		ja:"たった一度の完璧な隙を待つ、規律ある赤き戦士。"
	},
	mission:{
		key:"TotalKillCount",
		target:1600,
		text:{
			en:"Defeat a total of 1,600 vacuums.",
			tr:"Toplam 1.600 süpürge yok et.",
			ru:"Уничтожьте в общей сложности 1 600 пылесосов.",
			es:"Derrota un total de 1.600 robots aspiradores.",
			de:"Besiege insgesamt 1.600 Saugroboter.",
			fr:"Éliminez un total de 1 600 robots aspirateurs.",
			pt:"Derrote um total de 1.600 robôs aspiradores.",
			ja:"ロボット掃除機を合計1,600台倒す。"
		}
	}
},

{
	id:35,
	name:{
		en:"Plasma Vanguard",
		tr:"Plasma Vanguard",
		ru:"Plasma Vanguard",
		es:"Plasma Vanguard",
		de:"Plasma Vanguard",
		fr:"Plasma Vanguard",
		pt:"Plasma Vanguard",
		ja:"Plasma Vanguard"
	},
	rarity:{
		en:"Mythic",
		tr:"Mitik",
		ru:"Мифический",
		es:"Mítico",
		de:"Mythisch",
		fr:"Mythique",
		pt:"Mítico",
		ja:"ミシック"
	},
	desc:{
		en:"A front-line assault cleaner driven by a volatile plasma core.",
		tr:"Dengesiz bir plazma çekirdeğiyle çalışan ön cephe saldırı temizleyicisi.",
		ru:"Штурмовой уборщик передовой, работающий от нестабильного плазменного ядра.",
		es:"Un limpiador de asalto de primera línea impulsado por un núcleo de plasma inestable.",
		de:"Ein Angriffsreiniger für die Frontlinie, angetrieben von einem instabilen Plasmakern.",
		fr:"Un nettoyeur d'assaut de première ligne, propulsé par un noyau plasma instable.",
		pt:"Um limpador de assalto da linha de frente movido por um núcleo de plasma instável.",
		ja:"不安定なプラズマコアで駆動する、最前線の強襲クリーナー。"
	},
	mission:{
		key:"TotalMatchCount",
		target:200,
		text:{
			en:"Play 200 matches.",
			tr:"Toplamda 200 maç yap.",
			ru:"Сыграйте 200 матчей.",
			es:"Juega 200 partidas.",
			de:"Spiele 200 Partien.",
			fr:"Jouez 200 parties.",
			pt:"Jogue 200 partidas.",
			ja:"合計200回プレイする。"
		}
	}
},

{
	id:36,
	name:{
		en:"Solar Warden",
		tr:"Solar Warden",
		ru:"Solar Warden",
		es:"Solar Warden",
		de:"Solar Warden",
		fr:"Solar Warden",
		pt:"Solar Warden",
		ja:"Solar Warden"
	},
	rarity:{
		en:"Mythic",
		tr:"Mitik",
		ru:"Мифический",
		es:"Mítico",
		de:"Mythisch",
		fr:"Mythique",
		pt:"Mítico",
		ja:"ミシック"
	},
	desc:{
		en:"A golden fortress powered by a miniature sun.",
		tr:"Minyatür bir güneşten güç alan altın kale.",
		ru:"Золотая крепость, питаемая миниатюрным солнцем.",
		es:"Una fortaleza dorada alimentada por un sol en miniatura.",
		de:"Eine goldene Festung, angetrieben von einer Miniatursonne.",
		fr:"Une forteresse dorée alimentée par un soleil miniature.",
		pt:"Uma fortaleza dourada movida por um sol em miniatura.",
		ja:"小さな太陽を動力源にする、黄金の要塞。"
	},
	mission:{
	key:"PlayerBestScore",
	target:65536,
	text:{
		en:"Reach a Best Score of 64K.",
		tr:"En iyi skor olarak 64K'ya ulaş.",
		ru:"Достигните лучшего результата в 64K.",
		es:"Alcanza un mejor puntaje de 64K.",
		de:"Erreiche einen Bestwert von 64K.",
		fr:"Atteignez un meilleur score de 64K.",
		pt:"Alcance uma melhor pontuação de 64K.",
		ja:"ベストスコア64Kを達成する。"
	}
}
},

{
	id:37,
	name:{
		en:"Prism Sentinel",
		tr:"Prism Sentinel",
		ru:"Prism Sentinel",
		es:"Prism Sentinel",
		de:"Prism Sentinel",
		fr:"Prism Sentinel",
		pt:"Prism Sentinel",
		ja:"Prism Sentinel"
	},
	rarity:{
		en:"Mythic",
		tr:"Mitik",
		ru:"Мифический",
		es:"Mítico",
		de:"Mythisch",
		fr:"Mythique",
		pt:"Mítico",
		ja:"ミシック"
	},
	desc:{
		en:"Brilliant crystal armor refracts neon light into pure intimidation.",
		tr:"Parlak kristal zırhı neon ışığını saf gözdağına dönüştürür.",
		ru:"Сверкающая кристальная броня преломляет неон в чистое устрашение.",
		es:"Su brillante armadura de cristal refracta la luz de neón en pura intimidación.",
		de:"Glänzende Kristallpanzerung bricht Neonlicht in pure Einschüchterung.",
		fr:"Son armure de cristal brillante transforme la lumière néon en pure intimidation.",
		pt:"A brilhante armadura de cristal refrata a luz neon em pura intimidação.",
		ja:"輝くクリスタル装甲がネオンの光を屈折させ、圧倒的な威圧感を放つ。"
	},
	mission:{
		key:"TotalKillCount",
		target:2000,
		text:{
			en:"Defeat a total of 2,000 vacuums.",
			tr:"Toplam 2.000 süpürge yok et.",
			ru:"Уничтожьте в общей сложности 2 000 пылесосов.",
			es:"Derrota un total de 2.000 robots aspiradores.",
			de:"Besiege insgesamt 2.000 Saugroboter.",
			fr:"Éliminez un total de 2 000 robots aspirateurs.",
			pt:"Derrote um total de 2.000 robôs aspiradores.",
			ja:"ロボット掃除機を合計2,000台倒す。"
		}
	}
},

{
	id:38,
	name:{
		en:"Royal Paladin",
		tr:"Royal Paladin",
		ru:"Royal Paladin",
		es:"Royal Paladin",
		de:"Royal Paladin",
		fr:"Royal Paladin",
		pt:"Royal Paladin",
		ja:"Royal Paladin"
	},
	rarity:{
		en:"Mythic",
		tr:"Mitik",
		ru:"Мифический",
		es:"Mítico",
		de:"Mythisch",
		fr:"Mythique",
		pt:"Mítico",
		ja:"ミシック"
	},
	desc:{
		en:"Regal plating, unwavering defense and champion-class power.",
		tr:"Asil kaplama, sarsılmaz savunma ve şampiyon sınıfı güç.",
		ru:"Королевская броня, непоколебимая защита и мощь чемпионского класса.",
		es:"Blindaje real, defensa inquebrantable y potencia de campeón.",
		de:"Königliche Panzerung, unerschütterliche Verteidigung und Kraft auf Champion-Niveau.",
		fr:"Blindage royal, défense inébranlable et puissance digne d'un champion.",
		pt:"Blindagem real, defesa inabalável e potência de campeão.",
		ja:"王者の装甲、揺るぎない守り、そしてチャンピオン級の力。"
	},
	mission:{
		key:"TotalPlayTime",
		target:36000,
		text:{
			en:"Play for a total of 10 hours.",
			tr:"Toplam 10 saat oyun oyna.",
			ru:"Играйте в общей сложности 10 часов.",
			es:"Juega durante un total de 10 horas.",
			de:"Spiele insgesamt 10 Stunden.",
			fr:"Jouez pendant un total de 10 heures.",
			pt:"Jogue por um total de 10 horas.",
			ja:"合計10時間プレイする。"
		}
	}
},

{
	id:39,
	name:{
		en:"Void Paladin",
		tr:"Void Paladin",
		ru:"Void Paladin",
		es:"Void Paladin",
		de:"Void Paladin",
		fr:"Void Paladin",
		pt:"Void Paladin",
		ja:"Void Paladin"
	},
	rarity:{
		en:"Mythic",
		tr:"Mitik",
		ru:"Мифический",
		es:"Mítico",
		de:"Mythisch",
		fr:"Mythique",
		pt:"Mítico",
		ja:"ミシック"
	},
	desc:{
		en:"The final guardian forged for masters who rule the arena.",
		tr:"Arenaya hükmeden ustalar için dövülmüş nihai muhafız.",
		ru:"Последний страж, выкованный для мастеров, правящих ареной.",
		es:"El guardián definitivo forjado para los maestros que dominan la arena.",
		de:"Der letzte Wächter, geschmiedet für Meister, die die Arena beherrschen.",
		fr:"Le gardien ultime, forgé pour les maîtres qui règnent sur l'arène.",
		pt:"O guardião definitivo, forjado para os mestres que dominam a arena.",
		ja:"アリーナを支配する達人のために鍛えられた、最後の守護者。"
	},
	mission:{
		key:"TotalPlayerScore",
		target:500000,
		text:{
			en:"Reach a total score of 500,000.",
			tr:"Toplamda 500.000 puana ulaş.",
			ru:"Наберите в общей сложности 500 000 очков.",
			es:"Consigue un total de 500.000 puntos.",
			de:"Erreiche insgesamt 500.000 Punkte.",
			fr:"Atteins un score total de 500 000 points.",
			pt:"Alcance um total de 500.000 pontos.",
			ja:"合計500,000スコアを達成する。"
		}
	}
},
];
	

function updateSkinSystem(runtime)
{
	loadSkinSystem(runtime);
	checkSkinUnlocks(runtime);
	handleSkinUseRequest(runtime);
	updateSkinGameMessage(runtime);
	updateSkinButtonAlert(runtime);

	if (!runtime.objects.SkinPreview)
		return;

	normalizePreviewSkinId(runtime);
	updateSkinCards(runtime);
	updateSkinTexts(runtime);
}

function saveNewSkins()
{
	localStorage.setItem(
		STORAGE_NEW_SKINS,
		Array.from(newSkinIds).sort((a, b) => a - b).join(",")
	);
}
function updateSkinButtonAlert(runtime)
{
	const obj = runtime.objects.SkinButtonAlert;

	if (!obj)
		return;

	const inst = obj.getFirstInstance();

	if (!inst)
		return;

	inst.isVisible = newSkinIds.size > 0;
}
function loadSkinSystem(runtime)
{
	if (skinSystemLoaded)
		return;

	skinSystemLoaded = true;

	const savedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_SKINS);
	const savedNewSkins = localStorage.getItem(STORAGE_NEW_SKINS);

if (savedNewSkins)
{
	newSkinIds = new Set(
		savedNewSkins
			.split(",")
			.map(x => Number(x))
			.filter(x => Number.isFinite(x))
	);
}

	if (savedUnlocked)
	{
		unlockedSkins = new Set(
			savedUnlocked
				.split(",")
				.map(x => Number(x))
				.filter(x => Number.isFinite(x))
		);
	}
	

	for (let i = 0; i <= 4; i++)
		unlockedSkins.add(i);

	const savedSelected = Number(localStorage.getItem(STORAGE_SELECTED_SKIN));

	if (Number.isFinite(savedSelected) && unlockedSkins.has(savedSelected))
		equippedSkinId = savedSelected;

	runtime.globalVars.SelectedSkinID = equippedSkinId;
	runtime.globalVars.PlayerSkinID = equippedSkinId;
}

function normalizePreviewSkinId(runtime)
{
	let id = Number(runtime.globalVars.PlayerSkinID) || 0;

	if (id < 0)
		id = SKIN_MAX_ID;

	if (id > SKIN_MAX_ID)
		id = 0;

	runtime.globalVars.PlayerSkinID = id;
}

function checkSkinUnlocks(runtime)
{
	let changed = false;

	for (let id = 0; id <= SKIN_MAX_ID; id++)
	{
		if (unlockedSkins.has(id))
			continue;

		const rule = getSkinRule(id);
		const progress = getSkinProgress(runtime, rule);

		if (progress >= rule.target)
		{
			unlockedSkins.add(id);
			changed = true;
			lastUnlockedSkinId = id;
			skinMessageTimer = 4;
			newSkinIds.add(id);
			saveNewSkins();
			runtime.globalVars.NewSkinMessage = "NEW SKIN UNLOCKED!";
			runtime.callFunction("PlayNewSkinUnlockedSound");
		}
	}

	if (changed)
		saveUnlockedSkins();
}

function handleSkinUseRequest(runtime)
{
	if (runtime.globalVars.SkinUseRequest !== 1)
		return;

	runtime.globalVars.SkinUseRequest = 0;

	const id = Number(runtime.globalVars.PlayerSkinID) || 0;

	if (!unlockedSkins.has(id))
		return;

	equippedSkinId = id;
	runtime.globalVars.SelectedSkinID = id;
	localStorage.setItem(STORAGE_SELECTED_SKIN, String(id));
}

function updateSkinCards(runtime)
{
	const centerId = Number(runtime.globalVars.PlayerSkinID) || 0;

	updateSkinObjectSlots(runtime, "SkinPreview", centerId, true);
	updateSkinObjectSlots(runtime, "SkinLockOverlay", centerId, false);
	updateSkinObjectSlots(runtime, "SkinSelectedIcon", centerId, false);
}

function updateSkinObjectSlots(runtime, objectName, centerId, setFrame)
{
	const obj = runtime.objects[objectName];

	if (!obj)
		return;

	for (const inst of obj.getAllInstances())
	{
		const slotId = Number(inst.instVars.SkinId) || 0;
		const shownId = wrapSkinId(centerId + slotId - CENTER_SKIN_SLOT);
		const unlocked = unlockedSkins.has(shownId);
		const equipped = shownId === equippedSkinId;
		const isNew = newSkinIds.has(shownId);

		applySkinCardScale(inst, objectName, slotId === CENTER_SKIN_SLOT);

		inst.instVars.ShownSkinId = shownId;
		inst.instVars.IsLocked = unlocked ? 0 : 1;
		inst.instVars.IsEquipped = equipped ? 1 : 0;
		inst.instVars.IsCenter = slotId === CENTER_SKIN_SLOT ? 1 : 0;

		if (objectName === "SkinPreview")
		{
			inst.animationFrame = shownId;
		}

		if (objectName === "SkinLockOverlay")
		{
			inst.isVisible = !unlocked;
		}

		if (objectName === "SkinSelectedIcon")
		{
			if (equipped)
			{
				inst.isVisible = true;
				inst.animationFrame = 0; // Green check mark
			}
			else if (isNew)
			{
				inst.isVisible = true;
				inst.animationFrame = 1; // Red exclamation mark
			}
			else
			{
				inst.isVisible = false;
			}
		}
	}
}

function updateSkinTexts(runtime)
{
	const id = Number(runtime.globalVars.PlayerSkinID) || 0;
	if (newSkinIds.has(id))
{
	newSkinIds.delete(id);
	saveNewSkins();
}
	const data = getSkinData(id);
	const unlocked = unlockedSkins.has(id);
	const equipped = id === equippedSkinId;
	const rule = getSkinRule(id);
	const progress = getSkinProgress(runtime, rule);
	const currentProgress = Math.min(progress, rule.target);

	setTextObject(runtime, "SkinNumber", (id + 1) + "/" + (SKIN_MAX_ID + 1));
	setTextObject(runtime, "SkinNameText", langText(data.name) + "  -  " + langText(data.rarity));

	if (!unlocked)
	{
		setTextObject(runtime, "SkinButtonText", uiText("locked"));
		setTextObject(runtime, "SkinDescText", langText(data.desc));
		setTextObject(runtime, "MissionText", langText(rule.text));
		setTextObject(runtime, "SkinStatusText", "");
		setTextObject(
	runtime,
	"SkinProgressText",
	formatMissionValue(rule.key, currentProgress) +
	" / " +
	formatMissionValue(rule.key, rule.target)
);
		setProgressBar(runtime, currentProgress, rule.target, true);

		runtime.globalVars.SkinUnlocked = 0;
		setButtonFrame(runtime, 0);
		return;
	}

	if (equipped)
	{
		setTextObject(runtime, "SkinButtonText", uiText("play"));
		setTextObject(runtime, "SkinDescText", langText(data.desc));
		setTextObject(runtime, "MissionText", "");
		setTextObject(runtime, "SkinStatusText", "");
		setTextObject(runtime, "SkinProgressText", "");
		setProgressBar(runtime, 0, 1, false);

		runtime.globalVars.SkinUnlocked = 1;
		setButtonFrame(runtime, 2);
		return;
	}

	setTextObject(runtime, "SkinButtonText", uiText("use"));
	setTextObject(runtime, "SkinDescText", langText(data.desc));
	setTextObject(runtime, "MissionText", "");
	setTextObject(runtime, "SkinStatusText", "");
	setTextObject(runtime, "SkinProgressText", "");
	setProgressBar(runtime, 0, 1, false);

	runtime.globalVars.SkinUnlocked = 1;
	setButtonFrame(runtime, 1);
}

function getSkinData(id)
{
	return skinData[id] || {
		id,
		name: "Skin " + (id + 1),
		rarity: "Common",
		desc: "A new vacuum skin.",
		mission: {
			key: "TotalPlayerScore",
			target: id * 500,
			text: "Reach " + (id * 500) + " total score."
		}
	};
}

function getSkinRule(id)
{
	const data = getSkinData(id);

	if (!data.mission)
		return { key: "TotalPlayerScore", target: 0, text: "Unlocked" };

	return data.mission;
}







function getSkinProgress(runtime, rule)
{
	return Math.floor(Number(runtime.globalVars[rule.key]) || 0);
}

function saveUnlockedSkins()
{
	localStorage.setItem(
		STORAGE_UNLOCKED_SKINS,
		Array.from(unlockedSkins).sort((a, b) => a - b).join(",")
	);
}

function wrapSkinId(id)
{
	const count = SKIN_MAX_ID + 1;
	return ((id % count) + count) % count;
}



function setTextObject(runtime, objectName, value)
{
	const obj = runtime.objects[objectName];

	if (!obj)
		return;

	const inst = obj.getFirstInstance();

	if (!inst)
		return;

	inst.text = String(value);
}

function setButtonFrame(runtime, frame)
{
	const obj = runtime.objects.SkinUseButton;
	if (!obj)
		return;

	const inst = obj.getFirstInstance();
	if (!inst)
		return;

	inst.animationFrame = frame;
}

function setProgressBar(runtime, progress, target, show)
{
	const bgObj = runtime.objects.SkinProgressBarBg;
	const fillObj = runtime.objects.SkinProgressBarFill;

	if (!bgObj || !fillObj)
		return;

	const bg = bgObj.getFirstInstance();
	const fill = fillObj.getFirstInstance();

	if (!bg || !fill)
		return;

	bg.isVisible = show;
	fill.isVisible = show;

	if (!show)
		return;

	if (fill._baseWidth === undefined)
		fill._baseWidth = bg.width;

	const ratio = target > 0 ? Math.min(progress / target, 1) : 0;

	fill.width = fill._baseWidth * ratio;
}


function applySkinCardScale(inst, objectName, isCenter)
{
	if (objectName !== "SkinPreview" && objectName !== "SkinCard")
		return;

	if (inst._baseWidth === undefined)
	{
		inst._baseWidth = inst.width;
		inst._baseHeight = inst.height;
	}

	const scale = isCenter ? 1 : 1;

	inst.width = inst._baseWidth * scale;
	inst.height = inst._baseHeight * scale;
}


function updateSkinGameMessage(runtime)
{
	const notificationObj = runtime.objects.MissionNotificationText;
	const nameObj = runtime.objects.MissionNameText;
	const missionObj = runtime.objects.MissionTextGame;
	const progressObj = runtime.objects.MissionProgressText;
	const iconObj = runtime.objects.MissionSkinIcon;

	if (!notificationObj || !nameObj || !missionObj || !progressObj || !iconObj)
		return;

	const notificationText = notificationObj.getFirstInstance();
	const nameText = nameObj.getFirstInstance();
	const MissionTextGame = missionObj.getFirstInstance();
	const progressText = progressObj.getFirstInstance();
	const icon = iconObj.getFirstInstance();

	if (!notificationText || !nameText || !MissionTextGame || !progressText || !icon)
		return;

	const dt = runtime.dt || 1 / 60;

	if (skinMessageTimer > 0 && lastUnlockedSkinId >= 0)
	{
		skinMessageTimer -= dt;

		const data = getSkinData(lastUnlockedSkinId);

		notificationText.text = uiText("newSkinUnlocked");
		nameText.text = langText(data.name);
		MissionTextGame.text = langText(data.rarity);
		progressText.text = "";

		icon.animationFrame = lastUnlockedSkinId;
		setMissionHintProgressBar(runtime, 1, 1, true);

		return;
	}

	notificationText.text = uiText("nextTarget");

	missionHintTimer -= dt;

	if (missionHintTimer <= 0)
{
	missionHintTimer = 5;

	const hints = getTopSkinMissions(runtime, 4);

	if (hints.length > 0)
	{
		missionHintIndex++;

		if (missionHintIndex >= hints.length)
			missionHintIndex = 0;

		runtime._currentMissionHint = hints[missionHintIndex];
	}
	else
	{
		runtime._currentMissionHint = null;
	}
}

	const hint = runtime._currentMissionHint;

	if (!hint)
	{
		notificationText.text = "";
		nameText.text = "";
		MissionTextGame.text = "";
		progressText.text = "";
		setMissionHintProgressBar(runtime, 0, 1, false);
		return;
	}

	const currentProgress = Math.min(hint.progress, hint.rule.target);

	nameText.text = langText(hint.data.name);
	MissionTextGame.text = langText(hint.rule.text);
	progressText.text =
	formatMissionValue(hint.rule.key, currentProgress) +
	" / " +
	formatMissionValue(hint.rule.key, hint.rule.target);

	icon.animationFrame = hint.id;
	setMissionHintProgressBar(runtime, currentProgress, hint.rule.target, true);
}


function setMissionHintProgressBar(runtime, progress, target, show)
{
	const bgObj = runtime.objects.MissionHintBarBg;
	const fillObj = runtime.objects.MissionHintBarFill;

	if (!bgObj || !fillObj)
		return;

	const bg = bgObj.getFirstInstance();
	const fill = fillObj.getFirstInstance();

	if (!bg || !fill)
		return;

	bg.isVisible = show;
	fill.isVisible = show;

	if (!show)
		return;

	if (fill._baseWidth === undefined)
		fill._baseWidth = bg.width;

	const ratio = target > 0 ? Math.min(progress / target, 1) : 0;

	fill.width = fill._baseWidth * ratio;
}

function getTopSkinMissions(runtime, count = 4)
{
	const list = [];

	for (let id = 0; id <= SKIN_MAX_ID; id++)
	{
		if (unlockedSkins.has(id))
			continue;

		const data = getSkinData(id);
		const rule = getSkinRule(id);
		const progress = getSkinProgress(runtime, rule);

		if (!rule || rule.target <= 0)
			continue;

		const ratio = progress / rule.target;

		if (ratio <= 0 || ratio >= 1)
			continue;

		list.push({
			id,
			data,
			rule,
			progress,
			ratio
		});
	}

	list.sort((a, b) => b.ratio - a.ratio);

	return list.slice(0, count);
}


