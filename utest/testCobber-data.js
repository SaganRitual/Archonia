var adultCalories = 100, larvalCalories = 100, embryoThreshold = 200, reproductionThreshold = 500;
var hungerLo = embryoThreshold + reproductionThreshold, hungerHi = 0;

var optimalTemp = -200, optimalTempRange = 400;
var tempRadius = optimalTempRange / 2, tempLo = optimalTemp, tempHi = optimalTemp + tempRadius;

var senseMeasurementDepth = 10, caloriesPerManna = 100;

var reproductionCostFactor = 1.25;

var senseNames = [ 'fatigue', 'food', 'inertia', 'predators', 'prey', 'hunger', 'temperature', 'toxins' ];

module.exports = {

  archon: {
    genome: {
      optimalTemp: optimalTemp, optimalTempRange: optimalTempRange,
    
      offspringMass: { adultCalories: adultCalories, larvalCalories: larvalCalories },
    
      reproductionThreshold: reproductionThreshold, embryoThreshold: embryoThreshold,
    
      senseMeasurementDepth: senseMeasurementDepth,
    
      senses: {
        fatigue:     { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        food:        { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: caloriesPerManna },
        inertia:     { threshold: 0.5, multiplier: 1, decayRate: 0.00, valuesRangeLo: 0, valuesRangeHi: 1 },
        predators:   { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        prey:        { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        hunger:      { multiplier: 1, decayRate: 0.01, valuesRangeLo: hungerLo, valuesRangeHi: hungerHi },
        temperature: { multiplier: 1, decayRate: 0.01, valuesRangeLo: tempLo, valuesRangeHi: tempHi },
        toxins:      { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 }
      }
    }
  },
  
  senseTests: [
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 2}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0.92, 0.4, 0, 0.15, 0.82, 0, 0.51, 0, 0, 0]}, "hunger": {"inputs": [1120]}, "archon": {"prey": {"inputs": [0, 0.72, 0.29, 0, 0.56, 0, 0, 0.83, 0.14, 0.67, 0.4, 0.93]}, "predator": {"inputs": [0, 0.62, 0, 0.76, 0.48, 0, 0, 0, 0, 0, 0.93, 0.61]}}, "food": {"inputs": [{"calories": 51}, {"calories": 57.99999999999999}, {"calories": 50}, {"calories": 0}, {"calories": 4}, {"calories": 36}, {"calories": 0}, {"calories": 54}, {"calories": 67}, {"calories": 0}, {"calories": 65}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0.01, 0.18, 0.54, 0.39, 0.82, 0, 0, 0, 0, 0.38]}, "hunger": {"inputs": [140]}, "archon": {"prey": {"inputs": [0.96, 0, 0.12, 0, 0, 0.78, 0, 0, 0.42, 0.1, 0, 0.23]}, "predator": {"inputs": [0, 0, 0, 0.18, 0, 0, 0.71, 0.39, 0, 0, 0, 0.01]}}, "food": {"inputs": [{"calories": 0}, {"calories": 36}, {"calories": 0}, {"calories": 90}, {"calories": 100}, {"calories": 67}, {"calories": 86}, {"calories": 83}, {"calories": 81}, {"calories": 56.99999999999999}, {"calories": 0}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0.16]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0, 0.05, 0.12, 0.79, 0, 0.49, 0, 0.24, 0, 0.08]}, "hunger": {"inputs": [1020]}, "archon": {"prey": {"inputs": [0, 0, 0.5, 0, 0.11, 0, 0.65, 0, 0, 0, 0.74, 0]}, "predator": {"inputs": [0.56, 0.02, 0.9, 0, 0.47, 0, 0.72, 0, 0, 0, 0, 0]}}, "food": {"inputs": [{"calories": 97}, {"calories": 0}, {"calories": 0}, {"calories": 50}, {"calories": 12}, {"calories": 84}, {"calories": 0}, {"calories": 0}, {"calories": 43}, {"calories": 0}, {"calories": 0}, {"calories": 89}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.41, 0, 0, 0.62, 0, 0.25, 0, 0, 0.21, 0, 0.75, 0.25]}, "hunger": {"inputs": [360]}, "archon": {"prey": {"inputs": [0, 0.16, 0, 0, 0, 0.11, 0.68, 0, 0.84, 0.06, 0.86, 0.28]}, "predator": {"inputs": [1, 0.74, 0.58, 0, 0.27, 0.15, 0.4, 0, 0.48, 0.89, 0.8, 0.01]}}, "food": {"inputs": [{"calories": 0}, {"calories": 68}, {"calories": 0}, {"calories": 73}, {"calories": 31}, {"calories": 0}, {"calories": 77}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 60}, {"calories": 53}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 2}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0.07, 0.68, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "hunger": {"inputs": [1260]}, "archon": {"prey": {"inputs": [0.79, 0.46, 0.02, 0.14, 0, 0, 0, 0, 0, 0, 0.43, 0.33]}, "predator": {"inputs": [0.61, 0, 0.81, 0.39, 0.56, 0.09, 0, 0, 0.48, 0.33, 0.95, 0.22]}}, "food": {"inputs": [{"calories": 12}, {"calories": 97}, {"calories": 0}, {"calories": 88}, {"calories": 0}, {"calories": 62}, {"calories": 0}, {"calories": 78}, {"calories": 0}, {"calories": 48}, {"calories": 35}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 1}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0.91]}, "temperature": {"inputs": [-42, -200]}, "toxins": {"inputs": [0, 0, 0.73, 0.99, 0.26, 0, 0, 0, 0.45, 0.69, 0.68, 0.69]}, "hunger": {"inputs": [500]}, "archon": {"prey": {"inputs": [0, 0, 0, 0, 0.62, 0.25, 0, 0.11, 0.8, 0, 0.97, 0.84]}, "predator": {"inputs": [0, 0.2, 0.84, 0, 0, 0.93, 0, 0, 0, 0, 0, 0.51]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 44}, {"calories": 0}, {"calories": 63}, {"calories": 78}, {"calories": 0}, {"calories": 7.000000000000001}, {"calories": 57.99999999999999}, {"calories": 73}, {"calories": 0}, {"calories": 26}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 2}, "senses": {"fatigue": {"inputs": [0.88]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -14]}, "toxins": {"inputs": [0.09, 0.46, 0.09, 0.94, 0, 0.86, 0, 0, 0.93, 0, 0, 0]}, "hunger": {"inputs": [1400]}, "archon": {"prey": {"inputs": [0.89, 0, 0.96, 0.04, 0.23, 0.06, 0, 0, 0, 0.83, 0, 0.29]}, "predator": {"inputs": [0.28, 0, 0, 0, 0.86, 0, 0, 0.18, 0.09, 0.3, 0.58, 0.01]}}, "food": {"inputs": [{"calories": 16}, {"calories": 74}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 31}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 4}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0.11, 0.66, 0.88, 0.05, 0, 0, 0, 0.17, 0, 0.86]}, "hunger": {"inputs": [440]}, "archon": {"prey": {"inputs": [0, 0.4, 0.51, 0, 0.5, 0.93, 0, 0.36, 0, 0, 0.09, 0]}, "predator": {"inputs": [0, 0, 0.89, 0, 0, 0, 0, 0, 0, 0, 0.16, 0]}}, "food": {"inputs": [{"calories": 84}, {"calories": 24}, {"calories": 48}, {"calories": 51}, {"calories": 75}, {"calories": 0}, {"calories": 0}, {"calories": 56.00000000000001}, {"calories": 0}, {"calories": 34}, {"calories": 27}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.34, 0.07, 0, 0, 0.2, 0, 0, 0.08, 0, 0.7, 0.35, 0.7]}, "hunger": {"inputs": [1060]}, "archon": {"prey": {"inputs": [0, 0.31, 0.7, 0.97, 0, 0, 0, 0, 0.57, 0.87, 0, 0.52]}, "predator": {"inputs": [0.54, 0, 0, 0, 0, 0.61, 0.3, 0.75, 0, 0, 0, 0.2]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 13}, {"calories": 0}, {"calories": 89}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 75}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 0}, "senses": {"fatigue": {"inputs": [0.38]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.56, 0.05, 0, 0.05, 0, 0.87, 0, 0, 0.19, 0.85, 0, 0]}, "hunger": {"inputs": [1300]}, "archon": {"prey": {"inputs": [0.63, 0, 0.7, 0, 0, 0, 0, 0, 0.66, 0, 0, 0.45]}, "predator": {"inputs": [0.82, 0.08, 0.96, 0, 0, 0.43, 0, 0, 0.69, 0.97, 0, 0.26]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 43}, {"calories": 41}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 92}, {"calories": 0}, {"calories": 11}, {"calories": 15}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "eat", "direction": 7}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0.24, 0.3, 0, 0.15, 0, 0.41, 0.85, 0.11, 0.43, 0.99, 0]}, "hunger": {"inputs": [300]}, "archon": {"prey": {"inputs": [0.4, 0.97, 0.13, 0.63, 0.05, 0.01, 0.71, 0, 0.91, 0, 0.1, 0]}, "predator": {"inputs": [0, 0.97, 0.05, 0, 0.02, 0, 0, 0, 0, 0, 0.17, 0.73]}}, "food": {"inputs": [{"calories": 0}, {"calories": 75}, {"calories": 49}, {"calories": 0}, {"calories": 32}, {"calories": 8}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 45}, {"calories": 27}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 2}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0.72]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0]}, "hunger": {"inputs": [1320]}, "archon": {"prey": {"inputs": [0, 0, 0.58, 0.67, 0.42, 0.8, 0, 0.98, 0.63, 0.33, 0.33, 0]}, "predator": {"inputs": [0.81, 0.3, 0.31, 0.81, 0, 0, 0.97, 0, 0.54, 0, 0, 0]}}, "food": {"inputs": [{"calories": 0}, {"calories": 61}, {"calories": 18}, {"calories": 70}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 36}, {"calories": 78}, {"calories": 0}, {"calories": 0}, {"calories": 63}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0.1, 0.34, 0.35, 0.65, 0, 0.52, 0.57, 0.88, 0.69, 0.49, 0]}, "hunger": {"inputs": [480]}, "archon": {"prey": {"inputs": [0, 0.82, 0, 0.71, 0.47, 0, 0.71, 0.73, 0, 0.28, 0.66, 0]}, "predator": {"inputs": [0, 0, 0, 0.35, 0.13, 0, 0.98, 0, 0, 0, 0, 0.25]}}, "food": {"inputs": [{"calories": 82}, {"calories": 51}, {"calories": 50}, {"calories": 31}, {"calories": 0}, {"calories": 61}, {"calories": 0}, {"calories": 64}, {"calories": 97}, {"calories": 1}, {"calories": 0}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0.25, 0, 0.74, 0.7, 0.58, 0.48, 0.92, 0, 0.24, 0]}, "hunger": {"inputs": [1040]}, "archon": {"prey": {"inputs": [0.81, 0.46, 0.04, 0, 0, 0.06, 0, 0.13, 0.51, 0.53, 0.52, 1]}, "predator": {"inputs": [0.8, 0.43, 0.17, 0, 0, 0.97, 0.76, 0.61, 0.09, 0, 0.31, 0.8]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 63}, {"calories": 88}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 15}, {"calories": 77}, {"calories": 26}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0.69]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0.28, 0.37, 0, 0.79, 0, 0.52, 0, 0.65, 0.31, 0]}, "hunger": {"inputs": [80]}, "archon": {"prey": {"inputs": [0, 0, 0.69, 0.73, 0.02, 0, 0.67, 0.72, 0.72, 0, 0, 0]}, "predator": {"inputs": [0.9, 0, 0, 0, 0, 0, 0.78, 0, 0, 0, 0.47, 0]}}, "food": {"inputs": [{"calories": 5}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 80}, {"calories": 0}, {"calories": 24}, {"calories": 46}, {"calories": 0}, {"calories": 67}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 3}, "senses": {"fatigue": {"inputs": [0.66]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.31, 0, 0, 0.43, 0, 0, 0, 0, 0, 0, 0.61, 0.89]}, "hunger": {"inputs": [1920]}, "archon": {"prey": {"inputs": [0, 0, 0, 0.21, 0, 0, 0, 0, 0, 0.76, 0.85, 0.85]}, "predator": {"inputs": [0, 0, 0.54, 0, 0.22, 0, 0.27, 0, 0, 0.16, 0, 0.74]}}, "food": {"inputs": [{"calories": 91}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 31}, {"calories": 0}, {"calories": 0}, {"calories": 42}, {"calories": 35}, {"calories": 53}, {"calories": 100}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0.34]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0, 0, 0.44, 0.99, 0, 0, 0.92, 0.34, 0.22, 0, 0.92]}, "hunger": {"inputs": [840]}, "archon": {"prey": {"inputs": [0, 0, 0.08, 0, 0, 0.52, 0.36, 0.42, 0, 0, 0, 0.46]}, "predator": {"inputs": [0.73, 0, 0, 0, 0, 0, 0.83, 0.71, 0, 0, 0, 0]}}, "food": {"inputs": [{"calories": 48}, {"calories": 24}, {"calories": 0}, {"calories": 16}, {"calories": 0}, {"calories": 0}, {"calories": 95}, {"calories": 0}, {"calories": 0}, {"calories": 70}, {"calories": 0}, {"calories": 1}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0.14]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0, 0.45, 0.95, 0, 0, 0, 0.62, 0, 0, 0.58, 0, 0.8]}, "hunger": {"inputs": [360]}, "archon": {"prey": {"inputs": [0.76, 0, 0, 0.76, 0.72, 0.32, 0, 0.56, 0, 0, 0, 0.12]}, "predator": {"inputs": [0, 0, 0.58, 0.67, 0.52, 0.19, 0.4, 0, 0.78, 0.75, 0.75, 0.29]}}, "food": {"inputs": [{"calories": 52}, {"calories": 44}, {"calories": 0}, {"calories": 16}, {"calories": 43}, {"calories": 0}, {"calories": 0}, {"calories": 37}, {"calories": 76}, {"calories": 63}, {"calories": 25}, {"calories": 0}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 3}, "senses": {"fatigue": {"inputs": [0.6]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.39, 0.77, 0.38, 0, 0.33, 0.59, 0, 0, 0.33, 0, 0.2, 0]}, "hunger": {"inputs": [820]}, "archon": {"prey": {"inputs": [0, 0, 0.2, 0.5, 0.66, 0, 0.43, 0.73, 0, 0.18, 0.48, 0]}, "predator": {"inputs": [0, 0.65, 0, 0.53, 0.55, 0, 0.93, 0, 0, 0, 0.2, 0.29]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 22}, {"calories": 96}, {"calories": 0}, {"calories": 0}, {"calories": 20}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 47}]}}},
    {"loopCount": 1, "expectedResult": {"action": "pursue", "direction": 0}, "senses": {"fatigue": {"inputs": [0]}, "inertia": {"inputs": [0]}, "temperature": {"inputs": [-200, -200]}, "toxins": {"inputs": [0.57, 0, 0, 0.22, 0, 0.78, 0.4, 0.2, 0, 0, 0, 0.51]}, "hunger": {"inputs": [1080]}, "archon": {"prey": {"inputs": [0, 0, 0, 0, 0, 0.25, 0, 0.7, 0, 1, 0, 0]}, "predator": {"inputs": [0.36, 0.17, 0.26, 0, 0, 0.8, 0.55, 0, 0.23, 0.52, 0, 0]}}, "food": {"inputs": [{"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 97}, {"calories": 16}, {"calories": 0}, {"calories": 0}, {"calories": 56.99999999999999}, {"calories": 0}, {"calories": 0}, {"calories": 0}, {"calories": 55.00000000000001}]}}}

    
/*

  var c = {};
    c.fillArray = function(sense, type, howManyElements, multiplier, probability) {
      for(var i = 0; i < howManyElements; i++) {
        var value = parseFloat(((Math.random() < probability) ? Math.random() : 0).toFixed(2), 10) * multiplier;
        
        switch(type) {
          case 0: c.st.senses[sense].inputs.push(value); break;
          case 1: c.st.senses.archon[sense].inputs.push(value); break;
          case 2: c.st.senses.food.inputs.push({ calories: value }); break;
        }
      }
    };
    
    c.makeSt = function(howMany) {
      for(var i = 0; i < howMany; i++) {
        c.st = {};
        c.st.loopCount = 1;
        c.st.expectedResult = { action: 'unknown', direction: 0 };
        c.st.senses = {};
        c.st.senses.fatigue = { inputs: [] };
        c.st.senses.inertia = { inputs: [] };
        c.st.senses.temperature = { inputs: [] };
        c.st.senses.toxins = { inputs: [] };
        c.st.senses.hunger = { inputs: [] };
        c.st.senses.archon = { prey: { inputs: [] }, predator: { inputs: [] }};
        c.st.senses.food = { inputs: [] };
    
        c.fillArray('temperature', 0, 2, 200, 0.05); c.st.senses.temperature.inputs[0] -= 200; c.st.senses.temperature.inputs[1] -= 200;
        c.fillArray('toxins', 0, 12, 1, 0.5);
        c.fillArray('predator', 1, 12, 1, 0.5);
        c.fillArray('prey', 1, 12, 1, 0.5);
        c.fillArray('food', 2, 12, 100, 0.5);
        c.fillArray('hunger', 0, 1, 1, 0.9); c.st.senses.hunger.inputs[0] *= 2000;
        c.fillArray('inertia', 0, 1, 1, 0.2);
        c.fillArray('fatigue', 0, 1, 1, 0.2);
    
        fs.appendFileSync('st.json', stringify(c.st, {maxLength:Infinity}) + ",\n");
      }
    };
*/
  ]
};
