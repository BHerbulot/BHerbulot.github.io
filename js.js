/* global webkitSpeechRecognition, webkitSpeechGrammarList */

const SpeechRecognition = webkitSpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList;

let url = 'api.giphy.com/v1/gifs/search?q=!toreplace!&lang=fr&api_key=BDABlr8a5LxEgp1TYopHQE1ysoE2ghC8&limit=1';

let list = [
    'Lion',
    'Avion',
    'Koala',
    'Kangourou',
    'Lapin',
    'Chat',
    'Cuisine',
    'Velo',
    'Voiture',
    'Helicoptere',
    'Hippopotame',
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
            let scheme = location.protocol.startsWith('http') ? location.protocol: 'http:';
            let newUrl = url.replace('!toreplace!', this.currentWord);
            document.querySelector('.current-letter').classList.remove('error-letter');
            fetch(`${scheme}//${newUrl}`).then((res) => {
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

        recognition.onresult = (/*event*/) => {
            this.reset();
        };
        recognition.onspeechend = function() {
            console.debug('end');
            recognition.stop();
        };
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
                span.classList.add('current-letter');
                this.speak(char);
            }
            count ++;
            this.wordDom.append(span);
            this.canPlay = true;
        }
    }

    speak (val){
        if(val.length == 1){
            var audio = new Audio(`sounds/son-lettres-${val.toLowerCase()}.mp3`);
            audio.play();
        }
        else{
            var sp = new SpeechSynthesisUtterance(val);
            sp.voice = this.synth.getVoices().find((v)=> v.name === 'Google français');
            this.synth.speak(sp);
        }
    }
}



document.addEventListener('DOMContentLoaded', function(){
    let wordDom = document.querySelectorAll('.word-to-find')[0];
    let letterDom = document.querySelectorAll('.upcomming-letter')[0];
    let gameManager = new GameManager(wordDom, letterDom);
    setTimeout(() => {
        gameManager.init();
    }, 500);

}, false);
