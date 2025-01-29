{
    class Character {
        constructor (name=null, data={}) {
            this.name = name;
            this.visible = 1;
            this.inable  = 1;
        }
        get id () {
            return this.name;
        }
    }

    class Scenario {
        constructor (
              title         = null
            , scenario_type = "NORMAL"
        ) {
            this.title         = title;
            this.chara         = [];
            this.scenario_type = scenario_type;
            this.visible       = 0;
            this.inable        = 0;

            this.steps = [];
            this.options = [];
        }

        addCharacter (character) {
            this.characters.push(character);
        }

        addOption (step, option) {
            this.options.push({step, option});
        }

        addStep (step,type,text,chara) {
            this.steps.push({step,type,text,chara});
        }


    }

    class ScenarioGame {
        constructor () {
            this.scenarios = [];
            this.characters = [];

            this.scenarioIndex = {};
            this.characterIndex = {};
        }

        addScenario (title) {
            const scenario = new Scenario(title);
            this.scenarios.push(scenario);
        }

        getScenarios () {
            return this.scenarios;
        }
        getPlayableScenarios () {
            return this.scenarios.filter(v=>v.visible&&v.inable);
        }
        getScenario (index) {
            return this.scenarios[index];
        }

        getCharacters () {
            return this.characters;
        }
        getPlayableCharacters () {
            return this.characters.filter(v=>v.visible&&v.inable);
        }
        getCharacter (index) {
            return this.characters[index];
        }
    }

    window.ScenarioGame = ScenarioGame;
}