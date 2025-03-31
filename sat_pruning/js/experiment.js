//////////////////////////////////////////////////////////
////////              FUNCTIONS               ////////////

function pushDataMain(){
  mainData.responses.RT = mainRTarray;
  mainData.responses.actions = mainKeysArray;

  mainData.states = mainStateArray;
  mainData.points = mainPointsArray;
  mainData.planetConfigurations = mainPlanets;
  mainData.rocketStart = mainRocketStart;
  mainData.NoisyPlanet = mainNoisyPlanet;
  mainData.condition = condition;
  mainData.uncertainPlanetInOptimalSeq = uncertainPlanetInOptimalSeq;
  mainData.stateTransitionMatrix = stateTransitionMatrix;
  mainData.actinCost = actionCost;
  mainData.foundOptimalSequence = optimalFoundLog;
  mainData.mainPlanetMissedArray = mainPlanetMissedArray

};

///////////////////////////////
// INITIALIZATION FUNCTIONS


function assignPlanet(arrayRow){
  $('#planets .planet').each(function(i) {
      pl = arrayRow[i];
      $(this).attr('data-planet-img',pl);
      pl = (planetPoints[pl-1] > 0) ? "+"+planetPoints[pl-1]:planetPoints[pl-1];
      $(this).attr('data-points',pl);
  });
};

function initializeSquares(numSquares){
  if (numSquares == 2) {
    squaresWrapper.attr('data-num-squares','2');
  } else{
    squaresWrapper.attr('data-num-squares','3');
  }
};

// needs to happen only once, change initialize screen function; 
function initializePointsBar(){
  updatePointsBar();
};

function initializeRocket(rocketPos) {
  rocket.removeAttr('style');
  rocket.attr('data-pos',rocketPos-1);
};

// function initializeAsteroids(noise){
//   if (noise == 'high'){
//     $('#game-container').addClass('asteroids');
//   } else if (noise == 'low'){
//     $('#game-container').removeClass('asteroids');
//   }
// }

function initializeGameScreen(){

  if(isIntroduction){
    args = [introPlanets[trial],introRocketStart[trial]];
  // } else if (isTraining){
  //   args = [trainPlanets[trial], trainRocketStart[trial]];
  //   asteroidTrial = [5,10,15];
  } else if (isMain){
    args = [mainPlanets[trial], mainRocketStart[trial]];
  }

  planetsForMiniBlock = args[0];
  rocketPos = args[1];
  turnsForMiniblock = 3;

  turnsLeft = turnsForMiniblock;                           // only 3 actions possible
  assignPlanet(planetsForMiniBlock);
  initializeSquares(turnsForMiniblock);
  if(trial == 0){
    initializePointsBar();
  }
  initializeRocket(rocketPos);
  
  if(!isIntroduction){
    $('.showing-asteroids').removeClass('showing-asteroids')
    $('#planet' + (mainNoisyPlanet[trial])).addClass('showing-asteroids')
  }
};

//  UPDATE FUNCTIONS

function planetReward(newPos){
  if (isIntroduction){ 
    conf = introPlanets[trial];
  // } else if (isTraining) { conf = trainPlanets[trial];
  } else if (isMain) {
    conf = mainPlanets[trial]
  }

  reward = planetPoints[conf[newPos]-1];
  // console.log('current reward: ', reward)
  return reward
};

function updatePoints(newPos){
  // points_gain = planetReward(newPos); 
  points += planetReward(newPos);
  ps.push(points)
};
// rgb(227, 0, 28)
// rgb(0, 0, 255)

function updatePointsBar() {
  
  fillingW = points/max_points*100;
  fillingW = (fillingW > 100) ? 100: fillingW; // take care of overflow
  $('#points-filling').width(fillingW + '%');
  if (fillingW <= 12.5){
    $('#red-points-filling').css({'opacity':1})
  } else if (fillingW > 12.5 && $('#red-points-filling').css('opacity') != 0){
    $('#red-points-filling').css({'opacity': 0})
  }
};


function updateScore(newPos){
  updatePoints(newPos);
  updatePointsBar();
};


// SHIP NAVIGATION FUNCTIONS

function roundTo(x, n=10){
  return Math.round(x*(10**n))/10**n
};


function getTargetPosition(action, targetArray){
  pos = parseInt(rocket.attr('data-pos'));                 // get current position of the rocket
  newPos = targetArray[action][pos];             // get target index
  return newPos
};


function executeAction(key, enforcedMissing = false, targetInfos = NaN,cb=NaN){

  /*
  FUNCTION: retrieves rocket target information dependent on participant chosen action
  and initiations rocket movement animation
  FUNCTION ARGUMENTS:
    key: participant key input ("move" or "jump" key)
   */

    if (!rocket.hasClass('animating')){                                                        // do not initiatate animations if something is already animating

      action = +(key == jump)                                                                  // codify chosen action as index array

      newPosRocket = getTargetPosition(action, targets)                                        // retrieve planet target if rocket will NOT miss the correct target
      planetHasAsteroids = $('#planet' + (newPosRocket + 1)).hasClass('showing-asteroids')     // check if target planet is one with increased uncertainty

      if (planetHasAsteroids){

        if (enforcedMissing){
          willMissTarget = targetInfos[0]                                                      // decide if rocket will miss the target
          missTargets = targetInfos[1]   
        } else {
          willMissTarget = Math.random() > 0.5;                                                // decide if rocket will miss the target
          missTargets = Math.random() <= 0.5 ? missRight : missLeft;                           // choose random neighbour of target to land on
        }

      } else {
        
        willMissTarget = false                                                                 // if the planet is not one with increased uncertainty the rocket will never miss the target
      }

      if (isMain){

        misses.push(willMissTarget)

      }

      if(willMissTarget){                                                                      // if rocket will miss the tharget planet

        newPosRocket = [[[newPosRocket,350]],willMissTarget];                                  // record planet position (where rocket will land if it didn't miss), animation speed and whether target will be missed
        newPosRocket[0][1] = [getTargetPosition(action, missTargets),100]                      // record planet position (where rocket will land if it does miss target) and animation speed
      
      } else {                                                                                 // if rocket will NOT miss the target planet
        // NOWDEBUG
        newPosRocket = [[[newPosRocket,500]],willMissTarget];                               // record planet position (where rocket will land if it didn't miss), animation speed and whether target will be missed
        // newPosRocket = [[[newPosRocket,20]],willMissTarget];                                   // record planet position (where rocket will land if it didn't miss), animation speed and whether target will be missed
      }
  }

  animateRocket(newPosRocket,cb);                                                                  // initiate rocket animation
  // if (isMain){
    turnsLeft--;                                                                                  // udpate counter for number of turns left
  // }
};

// function executeIntroMove(key, prob){
//   if (key == jump && !rocket.hasClass('animating')){
    
//     missProb = prob;                  
//     newTarget = Math.random() <= 0.5; // choose random neighbour of target to land on
//     newTarget = newTarget ? 2 : 3;

//     if (isLearningUncertaintyLow){         // if no asteroids present
//       willMiss = missProb > lowLandProb;
//       cb = lowUncertaintyCallback
//     } else {
//       willMiss = missProb > highLandProb;
//       cb = highUncertaintyCallback
//     };

//     if (willMiss) {             // if rocket misses jump target
//       newPos = getTargetPosition(newTarget);
//       missed = true;
//     } else {  
//       newPos = getTargetPosition(1);
//     };
//     newPos[3] = resetPos;
//     // displayScore($('#score-jump'));
//     animateRocket(newPos, cb);
//   }
// };


function revertAnimation(newPos){
  setTimeout(function(){
    $(gameStage).addClass('inactive');

    setTimeout(function(){
      clearRocketStyle(newPos);
      rocket.removeClass('inactive animating');
      $(gameStage).removeClass('inactive');

      isReverting = false;    
      running = false;
    },1000)
  },500)
};


function pointsColor(){
    rocketPos = rocket.attr('data-pos');
    rocketPos = parseInt(rocketPos) + 1; 

    planetIdentity = $("#planet"+ rocketPos).attr('data-planet-img');

    if (planetIdentity > 3){
      $('#planet' + rocketPos).addClass("good")
    } else if (planetIdentity < 3){ 
      $('#planet' + rocketPos).addClass("bad")
    } else {
      $('#planet' + rocketPos).addClass("neutral")
    }
};


function animationEndFunction(posInfo, cb){

  console.log('new rocket position ' +  posInfo[0][0][0])
  animEnd = new Date(); //unnecessary?
  rocket.removeClass('animating');
  rocket.attr('data-pos',posInfo[0][0][0]);

  console.log(points) 
  if(screen >= 21 || isMain){
  // if(screen >= 26 || isMain || isTraining){
    updateScore(parseInt(rocket.attr('data-pos')));
    pointsColor()
    $('#planet'+(posInfo[0][0][0]+1)).addClass('showing-points');
  
  }

  if (isMain){
    animationEndTime = new Date();
    // console.log('time elapsed2 is:' + (animationEndTime.getTime() - animStart.getTime()));
    animationEnd.push(animationEndTime.getTime());
    // console.log('animationEnd: ' + animationEndTime.getTime())
    states.push(+rocket.attr('data-pos')+1);

    if (points <= 0){
      gameover = true;
      gameOverResultsUpdate();
      setTimeout(function(){

        // if (isTraining){
        //     trainCallback();
        // } else {
        mainCallback();
        // }
        gameover = false;
      }, 2000)
    }
  // console.log("t="+trial+', left: ' +turnsLeft+" animationEnd time: "+ animationEnd);
  }

  if (typeof(cb) == 'function') {
    if (posInfo.length == 3) {
        cb(posInfo[2]);
    } else {
        cb();
    }
  }
};


function animateRocket(posInfo, cb) {

  /* 
  FUNCTION: Animates the movement of the rocket in response
  to a participant inputting an action. 
  FUNCTION ARGUMENTS:
    posInfo: [[correctTarget, missedTarget], miss]
      correctTarget: array holding index of correct planet and
      the animation speed to that target[planetIndex, animationSpeed]
      missedTarget: array holding index of planet rocket would land to
      if target is missed and the animation speed to the new target planet
      miss: whether a miss will occur

    if a wiss will not occur posInfo = [[correctTarget], miss]*/

  rocket.addClass('animating');                                           // stop accepting participant input since choice animation in progress
  animStart = new Date();                                                 // record beginning of animation

  if(screen >= 21 || isMain){                                             // remove point display formatting from previous action 
      $('.showing-points').removeClass('showing-points');      
      $('.good, .bad, .neutral').removeClass('good bad neutral')      

  }

  miss = posInfo[1]                                                       // record whether a miss occured
  discounter = miss ? 0.66 : 1;                                           // indicated how far along intended path rocket will travel
        
  positionsAndDelays = posInfo[0]                                         // record correct and missed target index and animation speed information         
        
  currentTopRaw = parseFloat(rocket.css('top').split('px')[0])            // calculate current y position of rocket in px
  currentLeftRaw = parseFloat(rocket.css('left').split('px')[0])          // calculate current x position of rocket in px

  currentTopPercent = Math.round((currentTopRaw/window.innerHeight)*100)  // calculate current y position of rocket in percentage of viewport height
  currentLeftPercent = Math.round(currentLeftRaw/window.innerWidth*100)   // calculate current x position of rocket in percentage of viewport width

  newTargetTopPercent = positionInt[positionsAndDelays[0][0]][0]          // retrieve new y position of rocket in percentage of viewport height
  newTargetLeftPercent = positionInt[positionsAndDelays[0][0]][1]         // retrieve new x position of rocket in percentage of viewport height

  adjustTop = currentTopPercent + (newTargetTopPercent - currentTopPercent)*discounter       // calculate how much to move rocket in the y direction
  adjustLeft = currentLeftPercent + (newTargetLeftPercent - currentLeftPercent)*discounter   // calculate how much to move rocket in the x direction

  rocket.animate({
    top: adjustTop + '%',                                                  // x adjustment
    left:adjustLeft + '%',                                                 // y adjustment
  }, positionsAndDelays[0][1],                                             // animation speed

    function(){                                                            // on animation end

      if (positionsAndDelays.length == 2){                                 // if there is another target to animate to
      
        posInfo[0].shift();                                                // remove position information about previously animated target
        posInfo[1] = false;                                                // recode miss to false, since this is the final target position of the rocket
        animateRocket(posInfo, cb);
                                                // animate movement to new target planet
      } else{                                                              // if we just animated the movement to the final target

        animationEndFunction(posInfo, cb);                                 // call the function that finishes participant action execution
      }
    }
  );
};


function recordData(){
  if(trial !=-1){
    screenTransition = true;                                                // doubled since used to initialize screen as well
    mainKeysArray.push(keys);
    states.unshift(mainRocketStart[trial]);
    mainStateArray.push(states);
    mainPointsArray.push(ps);
    
    rt.push(keyPress[0] - stimulusDisplay);
    rt.push(keyPress[1] - stimulusDisplay);
    rt.push(keyPress[2] - stimulusDisplay);
    // rt.push(keyPress[1] - animationEnd[0]);
    // console.log(keyPress, stimulusDisplay, animationEnd)
    // rt.push(keyPress[2] - animationEnd[1])
    mainRTarray.push(rt);
    mainPlanetMissedArray.push(misses);
    
  } 
  
  rt = []; 
  stimulusDisplay = [];
  keyPress = [];
  animationEnd = [];
  keys = [];
  states = [];
  ps = [];
  misses = [];
  
}


// CONTROL FLOW FUNCTIONS FOR INTRO PART

function practiceMove(keycode){ 

  playing = true;

  if(keycode==move){
    if(!rocket.hasClass('animating') && !wrongKey && !isEnding){

      newPosRocket = getTargetPosition(0, targets)                                        // retrieve planet target if rocket will NOT miss the correct target
      newPosRocket = [[[newPosRocket,500]],false];  
      animateRocket(newPosRocket, practiceMoveCallback)
      practiceCounter++;
    }
  } else {
    if (!rocket.hasClass('animating') && !isEnding && !wrongKey) {
      wrongKey = true;
      displayWrongKey('#wrong-key-clockwise', ['MOVE',move]);
    }
  }
};


function practiceMoveCallback(){
// NOWDEBUG
if (practiceCounter == 6) {
// if (practiceCounter == 1) {
  isEnding = true;
  setTimeout( function(){
    practiceCounter=0;
    practiceJumpTotal = 0;
    clearRocketStyle(0); 
    points = 1000;
    initializePointsBar();
    screenSwitch(gameStage,'#screen-jump-1');
    screen--;
    setTimeout(function (){
      screenSwitch('#screen-jump-1', '#screen-jump-2');
      isEnding = false;
      playing = false;
    // NOWDEBUG
    },500)
    // },100)
  },1000)
}
};


function practiceJump(keycode){
  playing = true
  if(keycode==jump){
    isTransitioning = isReverting || isEnding;
    if(!rocket.hasClass('animating') && $('#wrong-key-jump').hasClass('inactive') && !isTransitioning){
      if (practiceCounter < 5){
        resetPos = practiceCounter+1;
      } else {
        resetPos = practiceCounter-5;
      }
      practiceJumpTotal += 1;
      newPosRocket = getTargetPosition(1, targets)                                        // retrieve planet target if rocket will NOT miss the correct target
      newPosRocket = [[[newPosRocket,500]],false, resetPos];  
      animateRocket(newPosRocket, practiceJumpCallback);
      practiceCounter++;
    }
  } else {
    if (!rocket.hasClass('animating') && !isEnding && !wrongKey && !isReverting) {
      wrongKey = true;
      displayWrongKey('#wrong-key-jump', ['JUMP',jump]);
    }
  }
};


function practiceJumpCallback(resetPos){
// NOWDEBUG
if (practiceCounter == 6){
// if (practiceCounter == 1){
  isEnding = true;
  setTimeout( function(){
    isEnding = false;
    playing = false;
    clearRocketStyle(0);
    screenSwitch(gameStage, '#jump-uncertainty-1');
    dispPattern = true;
    setTimeout(function(){
      dispPattern = false;
      //NOWDEBUG
    },2000)
    // },100)
    points = 1000
  },1000)    
} else {
  isReverting = true;
  setTimeout(function(){
    revertAnimation(resetPos);
  },1000)
}
};

moveOrJump                = [0     , 1         , 1     , 0        , 1     ,    1     , 0         , 1     , 0     , 1        , 0     , 0        ] 
learnUncertaintyMiss      = [false , true      , false , true     , false , true     , true      , false , false , true     , false , true     ]
learnUncertaintyDirection = [NaN   , missRight , NaN   , missLeft , NaN   , missLeft , missRight , NaN   , NaN   , missLeft , NaN   , missRight]
asteroidPlanets           = [NaN   , 4         , 5     , 5        , 1     , 2        , 2         , 4     , 4     , 6        , 6     , 1        ]
rocketResetPositions      = [1     , 2         , 3     , 4        , 5     , 0        , 1         , 2     , 3     , 4        , 5     , 0        ] 


function learnUncertainty(){

  playing = true;
  action = moveOrJump[uncertaintyTotal]

  if (uncertaintyTotal==0){
    wrongKeyMessage =  '#wrong-key-move';
  }

  if(keycode==actionKeys[action]){

     if($(wrongKeyMessage).hasClass('inactive') && !running){
    
      running = true;
      willMiss = learnUncertaintyMiss[uncertaintyTotal];
      missDirection = learnUncertaintyDirection[uncertaintyTotal];
      cb = learnUncertaintyCallback;
      executeAction(keycode, enforcedMiss=true, enforcedTarget = [willMiss, missDirection],cb=cb);
      uncertaintyTotal++;

    }

  } else if (!running && !wrongKey){

    wrongKey = true;
    wrongKeyMessage = action == 0 ? '#wrong-key-move': '#wrong-key-jump'
    displayWrongKey(wrongKeyMessage);
  };
};

function finishLearningUncertainty(){

  $(gameStage).addClass('inactive');
  clearRocketStyle(0)
  $('.showing-asteroids').removeClass('showing-asteroids')
  $('#turns').removeClass('inactive');         
  isLearningUncertainty = false;
  screen++;
  points = 1000
  uncertaintyTotal = 0;
  uncertaintyCounter = 0;
  running = false;
  playing = false;

}

function learnUncertaintyCallback(){

    // NOWDEBUG
  if (uncertaintyTotal == 12){
  // if (uncertaintyTotal == 1){

    if (willMissTarget){
    
      setTimeout(function(){
    
        $('#missed-target').removeClass('inactive');
    
        setTimeout(function(){

          $('#missed-target').addClass('inactive');
          finishLearningUncertainty();

        },2000);
    
      },1000)
  
    } else {

      setTimeout(finishLearningUncertainty, 1000)
    }


  } else {

    resetPos = rocketResetPositions[uncertaintyTotal-1]

    if (willMissTarget){
    
      setTimeout(function(){
    
        $('#missed-target').removeClass('inactive');
    
        setTimeout(function(){

          $(gameStage).addClass('inactive')
          $('#missed-target').addClass('inactive');
          $('.showing-asteroids').removeClass('showing-asteroids');
          $('#planet'+(asteroidPlanets[uncertaintyTotal])).addClass('showing-asteroids')
          revertAnimation(resetPos);
          missed = false;
    
        },2000);
    
      },1000)
    
    } else{
    
      setTimeout(function(){
    
        $(gameStage).addClass('inactive')
        $('.showing-asteroids').removeClass('showing-asteroids');
        $('#planet'+(asteroidPlanets[uncertaintyTotal])).addClass('showing-asteroids')
        revertAnimation(resetPos);
    
      },1000)
    
    }

  }
};


////////// MAIN PLAYING MINIBLOCK FUNCTIONS //////////
function playTurn(finishCallback) {

  allowedKey = (keycode == jump) || (keycode == move);
  rocketMoving = rocket.hasClass('animating');

  if (allowedKey && !rocketMoving && !screenTransition){

    keyPress.push(keyPressTime.getTime());
    // console.log("t="+trial+', left: ' +turnsLeft+" keyPress time: "+ keyPress);
    $('#square'+ turnsLeft).addClass('hideSquare');
    // displayScore(choosePoints());
    executeAction(keycode);
    keys.push(keycode == move ? 1:2);
    // ps.push(points);
    // console.log('pushed points')

    if (turnsLeft==0) {
      screenTransition = true;  
      setTimeout( function(){
        if(!gameover) {
          $('#game-container').addClass('inactiveStrong');
          finishCallback();
        }
      },1500);
    }
  } 

};


function finishTurn(){

  recordData();

  $('#main-transition-text').removeClass('inactive');
  $('.hideSquare').removeClass('hideSquare');
  $('.showing-points').removeClass('showing-points');
  console.log(trial)
  trial++;
  initializeGameScreen(); 

  setTimeout(function(){
    screenTransition = false;
    $('#main-transition-text').addClass('inactive');
    $('#game-container').removeClass('inactiveStrong');
    stimulusDisplayTime = new Date();
    // console.log('stimulus disp time: ' + stimulusDisplayTime.getTime())
    stimulusDisplay.push(stimulusDisplayTime.getTime());
    // console.log("t="+trial+', left: ' +turnsLeft+" stimulusDisplay time: "+ stimulusDisplay);        $(gameStage).removeClass('inactive');
    $(gameStage + ', #points-wrapper, #squares-wrapper').removeClass('inactive');

  }, 1500);
};

////////// CALLBACKS FOR FINISHING TURN IN EACH STAGE AND OTHER PLAY-TURN RELATED FUNCTIONS
currentlyShowingRoute = false;
willShowRoute = false;
optimalCounter = 0
transitionMessages = ['#not-optimal', '#not-optimal-2', '#not-optimal-3'];
 
function displayRoute(){

  if (keycode == 39){
    trial++;
    if( !currentlyShowingRoute) {
      currentlyShowingRoute = true;
      $('#not-optimal-3').addClass('inactive')
      initializeGameScreen();
      rocket.removeClass('animating');
      // trial--;
      $('.showing-points, .good, .bad, .neutral').removeClass('showing-points good bad neutral');
      $('#squares-wrapper').addClass('inactive');
      $('#game-container').removeClass('inactiveStrong')
      
      setTimeout(function(){
        $('#optimal-route').removeClass('inactive')
        currentMoves = moves[trial];
        setTimeout(function(){
          animateRouteDisplay(currentMoves)
        },1500)
      },500)}
  }
}


function animateRouteDisplay(currentMoves){

  if(currentMoves.length != 0) {

    if(!rocket.hasClass('animating')){

      rocket.addClass('animating')
      keycode = (currentMoves[0])

      if (keycode == jump){
        newPosInd = getTargetPosition(1,targets);
      } else if (keycode == move){
        newPosInd = getTargetPosition(0,targets); 
      }

      newPos = positions[newPosInd]

      $('.showing-points').removeClass('showing-points');
      $('.good, .bad, .neutral').removeClass('good bad neutral')
      
      rocket.animate({
        top:newPos[0],
        left:newPos[1],
      }, 500, function(){
        rocket.attr('data-pos',newPosInd);
        pointsColor()
        $('#planet'+(newPosInd+1)).addClass('showing-points');
      });

      setTimeout(function(){
        currentMoves.shift()
        rocket.removeClass('animating');
        animateRouteDisplay(currentMoves)
      },1500)
    } 
  } else if (currentMoves.length == 0){

    rocket.removeClass('animating');
    $('#squares-wrapper').removeClass('inactive')
    currentlyShowingRoute = false;
    willShowRoute = false;
    optimalFound = false;
    if (trial < 1){

      finishTurn()
      $('#game-container').addClass('inactiveStrong');
      $('#optimal-route').addClass('inactive');

    } else if(trial == 1){

      console.log(trial);
      $('#game-container').addClass('inactiveStrong');
      $('#intro-complete').removeClass('inactive');
      isIntroduction = false;
      isMain = true;
      screen++;
      points = 1000;
      // points = 19
      $('#optimal-route').addClass('inactive')
      initializePointsBar();

    }
  }
}


optimalFoundLog = [NaN, NaN];

function introCallback(){

  timeout = 1000
  optimalFound = checkActionOptimality();
  trial = optimalFound ? trial : trial-1;
  screenTitle = optimalFound ? $('#optimal'):$(transitionMessages[optimalCounter]);
  screenTitle.removeClass('inactive'); 
  optimalCounter = optimalFound ? 0 : optimalCounter+1;
  // optimalFound = false;
  
  if (optimalCounter < 3){

    setTimeout(function(){
    
      screenTitle.addClass('inactive');
      
      optimalFoundLog[trial] = true;
      
      if (optimalFound && trial == 1){
        $('#game-container').addClass('inactive');
        $('#intro-complete').removeClass('inactive');
        isIntroduction = false;
        isMain = true;
        screen++;
        // points = 350;
    
      } else {
    
        finishTurn()
    
      }

    
    },timeout);
  
  } else if (optimalCounter >= 3) {

      optimalFound = false;
      optimalFoundLog[trial+1] = false;
      willShowRoute = true;
      optimalCounter = 0;
  
    }

}
    
  // timeout = 2000;
  // setTimeout(function(){
  //   // NOWDEBUG
  //   if (trial == 3 ){
  //     // if (trial == 0){
  //       $('#game-container').addClass('inactive');
  //       $('#intro-complete').removeClass('inactive');
  //       isIntroduction = false;
  //       isMain = true;
  //       screen++;
  //       points = 350;
  //       // points = 19
  //       initializePointsBar();
  //       timeout = 1000;
  //     } else if (!willShowRoute) {
  //       finishTurn();
  //     }
  //   },4000);
    
// };
//   // currentlyShowingRoute = false;
//   // willShowRoute = false;

//   optimalCounter = 0;
// };


function mainCallback (){

  if(points <= 0){

    isMain = false;
    $(gameStage + ', #squares-wrapper').addClass('inactiveStrong');
    $('#game-over-main').removeClass('inactive');
    
    turnsLeft = 0
    experimentFinished = true;
    uploadResults();

  // NOWDEBUG
  } else if ((trial % 25 == 24) || trial == lastTrial) {
  // } else if (trial % 4 == 1 || trial == lastTrial) {
    displayBlockTransition();
    if(trial == lastTrial) {
      isMain = false;
      experimentFinished = true;
      recordData();
      uploadResults();
      $('#end-game').removeClass('inactive');

    }
  } else{
    finishTurn();
  }
};


function checkActionOptimality(){
  // alert([keys, correctResponses[trial]])
  matching = keys.filter((val, ind) => correctResponses[trial][ind] == val)
  matching = matching.length == 3 ? true : false 
  // alert([matching.length, matching])
  keys = [];
  return matching;
};


// SCREEN TRANSITION FUNCTIONS

function displayBlockTransition() {

if (trial == lastTrial) {
  $('#end-game').removeClass('inactive');
} else {
  $('#game-container').addClass('inactiveStrong');
  $('#block-transition').removeClass('inactive');
}
  // END GAME
blockTransition = true;
};


function hideBlockTransition() {
  if (trial == lastTrial){
      $('#main-transition-text').addClass('inactive');
  // NOWDEBUG
  // } else if ((trial % 4) == 1) {
  } else if ((trial % 25) == 24) {
  $('#block-transition').addClass('inactive');
  // END GAME
  }
  blockTransition = false;
};

//////////////// HELPER FUNCTIONS ///////////////////////
function clearRocketStyle(pos){
  rocket.attr('data-pos',pos);
  rocket.removeAttr('style');
};


function displayWrongKey(element,action){
  $('#game-container').addClass('inactiveStrong');
  // $( element + " p").text(function (_, ctx) {
  //   return ctx.replace("INSERT-" + action[0], alphabet[action[1]-65]);
  // });
  $(element).removeClass('inactive');
  setTimeout(function(){
    $(element).addClass('inactive')
    $('#game-container').removeClass('inactiveStrong');
    wrongKey = false;
  }, 1000);
};


function displayScore(element){
  element.removeClass('inactive')
  setTimeout(function(){
    element.addClass('inactive')
  }, 500);
};


function choosePoints(){
  if (keycode == 39) {
    return $('#score-clockwise');
  } else {
    return $('#score-jump');
  }
};


function transitionToMain(){
  $('#planetNumbers').addClass('inactive');
  points = 1000;
  isIntroduction = false;
  isMain = true;
  $('#main-intro-text').removeClass('inactive');
  $('#game-container').addClass('inactiveStrong');
  $(gameStage + ', #squares-wrapper').removeClass('inactive');
};


function screenSwitch(add, remove,classInfo=''){
  if(add != ''){
    $(add).addClass('inactive');
  }
  if (remove != ''){
    $(remove).removeClass('inactive');
  }

  if (classInfo != ''){
    element = classInfo[0]
    classToAdd = classInfo[1]
    $(element).addClass(classToAdd)
  }
  screen++;
  // displayButton()
};


function updateClasses(element, add, classes){
  // console.log('in here bro')
  if (add) {
    $(element).addClass(classes);
  } else {
    $(element).removeClass(classes);
  }
};


function revertScreen(){
    console.log(screenSequence[screen][1])
    add = screenSequence[screen][1];
    remove = screenSequence[screen][0]; 
    // if (screenSequence[screen].length > 2){
    //   updateClasses(screenSequence[screen][2], screenSequence[screen][4], screenSequence[screen][3])
    // }
    screen = screen - 2;
    console.log("thinks it is screen: " + screen)
    console.log('add inactive to: ' + add + ' and active to ' + remove)
    screenSwitch(add, remove);
    // displayButton() 
};


function progressScreen(add, remove,classInfo=''){
  onlyForwardScreens = [0,9,11,17]
  // if (onlyForwardScreens.filter(x=> x == screen).length != 0 && keycode != 39){
  //   alert('should not cycle back')
  // }
  if (keycode == 37 && onlyForwardScreens.filter(x=> x == screen).length == 0){
    console.log('current screen: ' + screen + ' and revrting to ' + (screen-1))
    revertScreen()
  } else {
    if (keycode == 39) {
      screenSwitch(add, remove,classInfo);
    }
  }
  
};

// function goBack(){
//   if ($.inArray(screen,buttonScreens)+1){
//     $('.back').removeClass('inactive');
//   } else {
//     $('.back').addClass('inactive');

//   }
// }


function uploadResults(){

if(experimentFinished){
  pushDataMain()

  saveDataFile()
  
  $.ajax({

      type: 'POST',
      url: '/save',
      data: {'data': JSON.stringify(mainData)},

      success: function() {
          console.log('success');
      },

      // Endpoint not running, local save
      error: function(err) {
        if (err.status == 400) { // this should happen first after 3h now!
          window.alert('server session timed out, you took way too long!')
        } else {
			// something unexpected happened
          window.alert('another unknown error:' + err.status)
        }
          // stopping experiment and forward page to /next
          console.log("Error with POST" + err.status)
        }
  });
}
};


function selectKeybindings() {
  not_unique = true
  while(not_unique){
    jump = Math.round(Math.random() * (90 - 65) + 65);
    move = Math.round(Math.random() * (90 - 65) + 65);
    not_unique = move == jump
  }

  return [jump,move]
};

function debugUncertainty(yes){
  $('#intro-1').addClass('inactive');
  screen = 15
  // dispPattern = false;
  // $('#planet2').addClass('showing-asteroids')
  // $('#jump-uncertainty-5').removeClass('inactive')

  // screen = 19
  // $('#planet3').addClass('showing-asteroids')
  // $('#jump-uncertainty-6').removeClass('inactive')
  // running = false
  // uncertaintyTotal = 0
  // isLearningUncertainty = false
  // isLearningJumpUncertainty = true

  // screen = 25
  // $('#tip-2').removeClass('inactive')

  $('#jump-uncertainty-5').removeClass('inactive');
}

function gameOverResultsUpdate(){
  
  tl = 0
  $('#squares-wrapper div').each(function(i){
    tl = tl + !($('#square'+(i+1 )).hasClass('hideSquare'))
  })
  
  for (i=0;i<tl;i++){
    keys.push(NaN)  
    states.push(NaN)
    ps.push(NaN)
    misses.push(NaN)
     
  }
  mainKeysArray.push(keys);
  states.unshift(mainRocketStart[trial]);
  mainStateArray.push(states);
  mainPointsArray.push(ps);
  
  rt.push(keyPress[0] - stimulusDisplay);
  rt.push(keyPress[1] - animationEnd[0]);
  console.log(keyPress, stimulusDisplay, animationEnd)
  // rt.push(NaN)
  rt.push(keyPress[2] - animationEnd[1])
  mainRTarray.push(rt);
  mainPlanetMissedArray.push(misses);
  rt = [];
  misses = [];
  stimulusDisplay = [];
  keyPress = [];
  animationEnd = [];
  keys = [];
  states = [];
  ps =[];
 
};


function debugMain(yes){
if(yes){
  $('#intro-1').addClass('inactive')
  $('#rocket, #pointBox, #planets, #squares-wrapper, #points-wrapper, #main-intro-text ').removeClass('inactive')
  $('#game-container').addClass('inactiveStrong')
  console.log($('#intro-1').hasClass('inactive'))
  isIntroduction = false
  isTraining = false
  isMain = true
  points = 350
} else{
  $('#intro-1').removeClass('inactive')
  $('#rocket, #pointBox, #planets, #squares-wrapper, #points-wrapper, #main-intro-text ').addClass('inactive')
  $('#game-container').removeClass('inactiveStrong')
  isIntroduction = true
  isTraining = false
  isMain = false
}
};


function debugTransition(yes){
$('#intro-1').addClass('inactive');
screen = 23
// progressScre en('#tip-3','#intro-practice-start');
$('#tip-3').removeClass('inactive')
// $('#intro-1').removeClass('inactive')
$('#rocket, #pointBox, #planets, #points-wrapper, #squares-wrapper').removeClass('inactive')
$('#game-container').addClass('inactiveStrong')
};


function debuggingAfterUncertainty(isDebugging) {
  if(isDebugging){
    screen = 21
    $('#tip-2').removeClass('inactive')
    $('#intro-1').addClass('inactive')
    
};

};

//////////////////////////////////////////////////////////
////////             PARAMETERS               ////////////
gameover = false;

data = {
main: 0,
train: 0
};

///////////////// COMMON VARIABLES //////////////////////
points = 1000;
isIntroduction = true;
// isTraining = false; 
isMain = false;

////////////// VARIABLES FOR INTRODUCTION //////////////// 
gameStage = '#rocket, #planets, #points-wrapper'
screen = 0;
practiceCounter = 0;
isReverting = false;

// NOWDEBUG
lastTrial = mainRocketStart.length - 1
// lastTrial = 9
////////////////////////////////////////////////////////

mainData = {
age: 0,
gender: 0,
group: 0,
balancingCondition: 1,
startingPoints:350,
responses: {
  RT: 0,
  actions: 0
  },
states: 0,
points: 0,
planetConfigurations: 0,
conditions: {
  notrials:0,
  noise:0
},
noPatternTrainings: 0,
// indexExp: indexExp,
// labelsExp: labelsExp,
};

// trainData = {
//   age: 0,
//   gender: 0,
//   group: 0,
//   responses: {
//     RT: 0, 
//     keys: 0,
//   },
//   states: 0,
//   points: 0,
//   planetConfigurations: 0,
//   conditions: {
//     notrials: 0,
//     noise: 0
//   },
//   noPatternTrainings: 0
// }

screenSequence = {
1: ['#intro-1', '#intro-2'],
2: ['#intro-2', '#planets, #intro-planets'],
3: ['','#rocket, #p-top'],
4: ['#rocket, #planets, #intro-planets', '#intro-3'],
5: ['#intro-3', gameStage+', #intro-points'],
// 5: ['#intro-3', '#intro-4'],
// 6: ['#intro-4', gameStage+', #intro-points'],
6: [gameStage+', #intro-points', '#intro-4'],
7: ['#intro-4','#intro-5'],
8: ['#intro-5',gameStage],
10: ['#screen-jump-2', gameStage],
// 12: ['#flightPattern-1', '#jump-uncertainty-1'],
12: ['#jump-uncertainty-1', gameStage, ['#planet2','showing-asteroids']],
13: [ gameStage, '#jump-uncertainty-2'],
14: ['#jump-uncertainty-2', '#jump-uncertainty-3'],
15: ['#jump-uncertainty-3', '#jump-uncertainty-5'],
// 16: ['#jump-uncertainty-4', '#jump-uncertainty-5'],
16: ['#jump-uncertainty-5', gameStage],
// 18: ['#jump-uncertainty-6', gameStage],
18: ['#turns', '#summary'],
19: ['#summary', '#tip-1'],
20: ['#tip-1', '#tip-2'],
21: ['#tip-2','#intro-practice-start'],
22: ['#last', '#last']
// 5: ['#intro-3', '#intro-4'], 
// 5: ['#intro-3', '#intro-4'], 
}


function saveDataFile() {
  
  // FUNCTION: can be used to save data locally
  // Function is just a prototype, can be extended to save whole experiment data

  // pushDataDD()
  // Convert the object to a JSON string
  const jsonString = JSON.stringify(mainData);

  // Create a new Blob object with the JSON string as its content
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a new anchor element to trigger the download
  const a = document.createElement("a");

  // Set the anchor's href attribute to the Blob object's URL
  a.href = URL.createObjectURL(blob);

  // Set the anchor's download attribute to the desired file name
  a.download = "SAT_pruning_" + Date.now().toString() + ".json";

  // Programmatically click the anchor to trigger the download
  a.click();

  // Clean up the Blob object's URL
  URL.revokeObjectURL(a.href);
}    // pos = Math.round( Math.random() * (m-1) );


////////// VARIABLES FOR INTRODUCTION ///////////
// NUMBER GAME
minRightAnswers =17;
answersGuessed= 0;
testStarts = [1,2,3,4,5,6,2,5,1,6,3,4,3,6,4,1,5,2];
rightAnswers = [5,4,5,6,2,2,4,2,5,2,5,6,5,2,6,5,2,4];
numberGameCounter = 0;

// JUMP UNCERTAINTY

missProbHigh = [0.9116, 0.6238, 0.7918, 0.4298, 0.5430, 0.4135, 0.0856, 0.7776, 0.4889, 0.0505, 0.5384, 0.0415];

points = 1000;
uncertaintyCounter = 0;

keysIntro = [];
/////////////////  GAMEPLAY PARAMETERS ///////////////////
last = 0;
trial = -1;
screenTransition = false;
blockTransition = false;

///////////////// DATA COLLECTION VARIABLES //////////////
experimentFinished = false;

ps = [];
mainRTarray = [];
mainKeysArray = [];
mainPointsArray = [];
mainStateArray = [];
mainPlanetMissedArray = [];

// trainRTarray = [];
// trainKeysArray = [];
// trainPointsArray = [];
// trainStateArray = [];
inds = [];

states = [];
stimulusDisplay = [];
keyPress = [];
animationEnd = [];
keys = selectKeybindings()
rt = [];
misses = [];
turnsLeft = NaN;
// move = keys[0]
// jump = keys[1]

key_binding = 0;

if (key_binding == 0){
  move = 77;
  jump = 88;
} else if (key_binding == 1) {
  move = 88;
  jump = 77;
} else {
  alert('wrong key binding.');
}

mainData.key_binding = key_binding;

actionKeys = [move,jump]
// moves = [[move, jump, jump], [move, jump, jump]];
moves = correctResponses.map( trial => trial.map((action, t) => actionKeys[action-1]))

alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
keys = [];
doneAlready = false;
playing = false;  



$( document ).ready(function() {
game = $('#game');
rocket = $('#rocket');
planets = $('#planets div');
squareClass= $('.square');
squaresWrapper = $('#squares-wrapper');
wrongKey = false;

// debugMain(true) 
// debugUncertainty(true)
// debugTransition(true)
// debuggingAfterUncertainty(true)
$( document ).keydown(function(event){
  
  keyPressTime = new Date();
  console.log('test')
  keycode = (event.keyCode ? event.keyCode : event.which);
  if (isIntroduction){

     if (screen == 7) {
      if(keycode==39){
        initializePointsBar();
        assignPlanet([3,3,3,3,3,3])
      }
      isEnding = false;
      wrongKey = false;
    } else if (screen == 8){
      practiceMove(keycode);   
    } else if (screen == 10) {
      practiceJump(keycode);
    } else if (screen == 15){
      isReverting = false;
      uncertaintyTotal = 0;
      missed = false;
      running = false;
    } else if (screen == 16){
      isLearningUncertainty = true; 
      learnUncertainty();
    // } else if (screen == 18){
    //   isLearningJumpUncertainty = true;
    //   wrongKeyMessage = '#wrong-key-jump'
    //   learnUncertainty(action=1);
    } else if (screen == 21) {
      if(keycode == 39 && ! $('#intro-practice-start').hasClass('inactive')){
        $('#intro-practice-start').addClass('inactive')
        $('.showing-asteroids').removeClass('showing-asteroids')
        screenTransition = true;
        finishTurn();
        transitionFromOptimalDisplay = false;
        optimalFound = false;
        playing = true
        } else if (!willShowRoute && !screenTransition && !rocket.hasClass('animating')){
          playTurn(introCallback);
        } else if (willShowRoute && !currentlyShowingRoute){
          displayRoute()
        };
      // }
    }
  
    if (!playing && (keycode == 39 || keycode == 37)){
      add = screenSequence[screen+1][0]
      remove = screenSequence[screen+1][1]
      if (screenSequence[screen+1].length > 2){
        classInfo = screenSequence[screen+1][2]
      } else {
        classInfo = ''
      }
      progressScreen(add,remove, classInfo)
    }

  } else if (isMain) {

      if(screen == 22){
    
        if (keycode == 39){
          screenSwitch('#intro-complete', '#main-intro-text');
          points = mainData.startingPoints;
          trial = -1;
          keyPress = []; stimulusDisplay = []; animationEnd = [];
          mainRTarray = []; mainPointsArray = []; mainStateArray = []; mainKeysArray = [];
        }

      } else {

        if (!$('#main-intro-text').hasClass('inactive') || !$('#main-intro-text-gameover').hasClass('inactive')) {
          if (keycode == 39){
            // $('#game-container').removeClass('asteroids')
          $('#main-intro-text').addClass('inactive');
          keyPress = []; stimulusDisplay = []; animationEnd = [];
          mainRTarray = []; mainPointsArray = []; mainStateArray = []; mainKeysArray = [];
          screenTransition = true; 
          finishTurn();
          }
        } else if(!blockTransition) {
          playTurn(mainCallback);
        } else {
          if(keycode == 39){
            hideBlockTransition();
            finishTurn();
          }
        }
      }
  } else if (experimentFinished && keycode== 39 ){  
      document.location = '/next'
  }


  //////////////////////////
});
});
