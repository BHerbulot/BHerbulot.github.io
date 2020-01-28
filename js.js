const SpeechRecognition = webkitSpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList;
const SpeechRecognitionEvent = webkitSpeechRecognitionEvent;


let apiKey = 'BDABlr8a5LxEgp1TYopHQE1ysoE2ghC8';
let url = 'https://api.giphy.com/v1/gifs/search?q=!toreplace!&lang=fr&api_key=BDABlr8a5LxEgp1TYopHQE1ysoE2ghC8&limit=1';

let list = [
    'LION',
    'AVION',
    'KOALA',
    'KANGOUROU',
    'LAPIN',
    'CHAT',
    'CUISINE',
    'VELO',
    'VOITURE',
    'HELICOPTERE',
    'HIPPOPOTAME',
];


class GameManager {

    constructor(wordDom, letterDom){
        this.currentWord = list[0];
        this.listPosition = 0;
        this.currentIndex = 0; // index letter
        this.wordDom = wordDom;
        this.letterDom = letterDom;
        this.canPlay = false;
        this.synth = window.speechSynthesis;

    }

    reset (){
        this.currentWord = list[0];
        this.listPosition = 0;
        this.currentIndex = 0; // index letter
        this.canPlay = false;
        this.init();
    }

    goNextChar (){
        if(this.currentIndex >= this.currentWord.length -1){
            this.canPlay = false;
            let newUrl = url.replace('!toreplace!', this.currentWord);
            document.querySelector('.current-letter').classList.remove('error-letter');
            fetch(newUrl).then((res) => {
                return res.json();
            }).then((res) => {
                this.speak(this.currentWord);
                let imgContainer = document.querySelector('.img-container');
                imgContainer.innerHTML = `<img src="${res.data[0].images.fixed_height.url}"/>`;
                imgContainer.animate([
                    { height: '0px'},
                    { height: '200px'},
                ], {duration: 400});
                setTimeout(() => {
                    this.goNextWord();
                }, 3000);
            }).catch((e) => {
                console.debug(e);
            });
        }else{
            let foundLetter = document.querySelector('.current-letter');
            foundLetter.classList.remove('current-letter', 'error-letter');
            this.currentIndex++;
            let nextLetter = foundLetter.nextElementSibling;
            nextLetter.classList.add('current-letter');
            this.speak(nextLetter.innerText);
        }
    }

    init (){
        this.displayWord();
        document.addEventListener('keydown', (e) => {
            if(this.canPlay){
                if(e.key.toUpperCase() === this.currentWord[this.currentIndex].toUpperCase()){
                    this.goNextChar();
                }else{
                    document.querySelector('.current-letter').classList.add('error-letter');
                    console.debug(document.querySelector('.current-letter'));
                    document.querySelector('.current-letter').animate([
                        // keyframes
                        { transform: 'translate(10px)' },
                        { transform: 'translate(-10px)' },
                        { transform: 'translate(8px)' },
                        { transform: 'translate(-8px)' },
                        { transform: 'translate(4px)' },
                        { transform: 'translate(0px)' },
                    ], {
                        // timing options
                        duration: 400,
                        iterations: 1
                    });
                }
            }
        });
    }

    goNextWord (){
        document.querySelectorAll('.word-to-find')[0].innerHTML = '';
        document.querySelectorAll('.img-container')[0].innerHTML = '';
        if(this.listPosition >= list.length - 1){
            this.gameFinished();
            return;
        }
        this.listPosition++;
        this.currentWord = list[this.listPosition];
        this.currentIndex = 0; // index letter
        this.displayWord();
    }

    async gameFinished() {
        await this.speak('Bien jouer tu as finis. Dit rejouer pour recommencer');
        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString('rejouer', 1);
        recognition.grammars = speechRecognitionList;
        //recognition.continuous = false;
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;


        recognition.start();

        recognition.onresult = (event) => {
            console.debug('coucou');
            this.reset();
        };
        recognition.onspeechend = function() {
            console.debug('end');
            recognition.stop();
        };

        // recognition.onnomatch = function(event) {

        // }

        // recognition.onerror = function(event) {

        // }
    }

    checkChar (){

    }

    displayWord (){
        let count = 0;
        for(let char of this.currentWord){
            let span = document.createElement('span');
            span.classList.add('letter');
            span.innerHTML = char;
            if(count === this.currentIndex){
                setTimeout(() => {
                    span.classList.add('current-letter');
                    this.speak(char);

                },500);
            }
            count ++;
            this.wordDom.append(span);
            this.canPlay = true;
        }
    }

    speak (val){
        return new Promise((resolve) => {
            var sp = new SpeechSynthesisUtterance(val);
            sp.voice = this.synth.getVoices().find((v)=> v.name === 'Google français');
            this.synth.speak(sp);
            sp.onend = (event) => {
                resolve();
            };
        });
    }
};



document.addEventListener('DOMContentLoaded', function(){
    let wordDom = document.querySelectorAll('.word-to-find')[0];
    let letterDom = document.querySelectorAll('.upcomming-letter')[0];
    let gameManager = new GameManager(wordDom, letterDom);
    gameManager.init();

}, false);
