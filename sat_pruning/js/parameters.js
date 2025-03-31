positions = [['48%','20%'], ['24%','40%'], ['24%','60%'], ['48%','80%'], ['74%','60%'], ['74%','40%']];
positionInt = [[48,20], [24,40], [24,60], [48,80], [74,60], [74,40]];

max_points = 4000

lowLandProb = 0.9;
highLandProb = 0.5;

targets    = [[1, 2, 3, 4, 5, 0],    // deterministic move
             [2, 3, 4, 5, 0, 1]]     // deterministic jump

missRight = [[0, 1, 2, 3, 4, 5],     // right miss for move
             [1, 2, 3, 4, 5, 0]]     // right miss for jump
             
missLeft  = [[2, 3, 4, 5, 0, 1],     // left miss for move
             [3, 4, 5, 0, 1, 2]]     // left miss for jump

correctResponses = [[1, 2, 2], [1,2,2]];
max_points = 5000

function assignValues(config){
    
    introPlanets = config[0].Planet_Feedback;
    rewardPlanetColors = config[0].Rew_Planets;
    introPlanetColors = config[0].Practise;
    
    planetPoints = config[0].planetRewards;
    
    introRocketStart = config[0].conditionsFeedback.starts;
    // introTurns = config[0].conditionsFeedback.notrials;
    // introNoise = config[0].conditionsFeedback.noise;
    
    // MISSING?
    // trainPlanets = config[0].planetsPractise;
    // console.log(trainPlanets)
    // trainRocketStart = config[0].startsPractise;
    // console.log(trainRocketStart)
    // trainNoise = config[0].conditionsPractise.noise;
    // console.log(trainNoise)
    // trainTurns = config[0].conditionsPractise.notrials;
    // console.log(trainTurns)
    
    mainPlanets = config[0].conditionsExp.planetsExp;
    mainRocketStart = config[0].conditionsExp.startsExp;
    mainNoisyPlanet = config[0].conditionsExp.uncertain_planet;

    condition = config[0].conditionsExp.condition;
    uncertainPlanetInOptimalSeq = config[0].conditionsExp.uncertain_planet_in_optimal_seq_PD3;
    stateTransitionMatrix = config[0].conditionsExp.tm;

    // mainTurns = config[0].conditionsExp.notrials;
    // mainNoise =  config[0].conditionsExp.noise
    
    actionCost = config[0].actionCost;

    // mainPlanets = mainPlanets.filter((x, ind ) => ind < 5)
    // mainRocketStart = mainRocketStart.filter((x, ind ) => ind < 5)

    // console.log(mainPlanets[trial])
    // console.log(mainRocketStart[trial])
    // console.log(mainNoisyPlanet[trial])
    // console.log(mainTurns)
    // console.log(mainNoise)
}

config = JSON.parse(config);
assignValues(config);

