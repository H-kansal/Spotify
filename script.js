let songs=[];
let currentSong=new Audio();
let currFolder='newsongs';
let folders=[];

let songName=document.getElementById('songName');
let songTime=document.getElementById('songTime');
let playBtn=document.getElementById('play');
document.querySelector('#volumerange').value='100';
async function getSongs(){
    let s=await fetch(`http://127.0.0.1:3000/project/spotify/songs/${currFolder}`)
    let response= await s.text();    // important step
    let div=document.createElement('div')
    div.innerHTML=response;
    let songLinks=div.getElementsByTagName('a')
    Array.from(songLinks).forEach(element => {
       if(element.href.endsWith('.mp3')){
        let songName=element.href.split(`/songs/${currFolder}/`)[1];
        // console.log(songName)
        songs.push(songName);
       }
    });
    // console.log(songs)
   return songs;
}

async function get(){
    try{
        songs=[];
        songs=await getSongs();
        let songUL=document.querySelector('.songList')
        songUL.innerHTML="";
        for (const song of songs) {
            let newLi=document.createElement('li');
            let songcontent=decodeURIComponent(song).replace('.mp3','').replace(/\s\(\d+\)|\s-\sCopy/g, '').trim().replaceAll('-',' ');
            newLi.innerHTML=`
                        <img src="./images/music_player.svg" alt="" class="invertImage">
                        <div class="songinfo">
                            <p>${songcontent}</p>
                        </div>
            `;
            songUL.appendChild(newLi)
            newLi.addEventListener('click',(e)=>{
                // console.log(e)
                playBtn.getElementsByTagName('img')[0].src='./images/pause2.svg'
                songName.innerText=decodeURIComponent(song).replace('.mp3','').replace(/\s\(\d+\)|\s-\sCopy/g, '').trim().replaceAll('-',' ');
                songTime.innerText='00:00/00:00'
                playMusic(song);
            })
        }
    }catch(error){
        console.log(error)
    }
}

async function addAlbum(){
    let f=await fetch(`http://127.0.0.1:3000/project/spotify/songs`);
    let response=await f.text();
    let div=document.createElement('div');
    div.innerHTML=response;
    let allfolder=div.getElementsByTagName('a');
    let artistSection=document.getElementsByClassName('artistSection');
    // console.log(allfolder)
    artistSection[0].innerHTML="";
    for(let link of allfolder){
        if(link.href.includes('/songs/')){
           let folder=link.href.split('/').at(-2);
           folders.push(folder);
           let i= await fetch(`http://127.0.0.1:3000/project/spotify/songs/${folder}/info.json`);
           let response2=await i.json();
           artistSection[0].innerHTML+=`<div class="cards" data-folder=${folder}>
                           <img aria-hidden="false" draggable="false" loading="lazy" src="./songs/${folder}/image.JPEG" class="rounded-image">
                            <h4 class="textcolor">${response2.name}</h4>
                            <p class="textcolor">${response2.description}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="#010101" class="image">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>`
        }
        // console.log(artistSection)
    }

    Array.from(document.getElementsByClassName('cards')).forEach((element)=>{
        element.addEventListener('click',()=>{
            playBtn.getElementsByTagName('img')[0].src='./images/play_arrow_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg'
            songTime.innerText='00:00/00:00'
            currFolder=element.dataset.folder;
            songName.innerText='';
            document.getElementsByClassName('circle')[0].style.left='0%';
            playMusic('')
            get();
        })
    })
}

addAlbum();

const playMusic=(track)=>{
     currentSong.src=`/project/spotify/songs/${currFolder}/${track}`
     document.querySelector('#volumerange').value='100';
     currentSong.play();
     currentSong.addEventListener('timeupdate',()=>{
        songTime.innerText=`${convertIntoMinute(currentSong.currentTime)}/${convertIntoMinute(currentSong.duration)}`
        document.getElementsByClassName('circle')[0].style.left=(currentSong.currentTime/currentSong.duration)*100+'%';
     })
}

function convertIntoMinute(seconds){
    if(isNaN(seconds) || seconds<0) return '00:00';
    const mins = Math.floor(seconds / 60); // Get the whole number of minutes
    const secs = Math.floor(seconds % 60); // Get the remaining seconds
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`; 
}

playBtn.addEventListener('click',()=>{
    if(currentSong.paused && currentSong.currentTime>0){
        playBtn.getElementsByTagName('img')[0].src='./images/pause2.svg'
        currentSong.play();
    }
    else if(currentSong.currentTime>0){
        playBtn.getElementsByTagName('img')[0].src='./images/play_arrow_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg'
        currentSong.pause();
    }
})

// hamburger image
document.querySelector('#hamburgerimg').addEventListener('click',()=>{
     document.querySelector('.sectionLeft').style.left='0px';
})
// cross image
document.querySelector('.cross').addEventListener('click',()=>{
    document.querySelector('.sectionLeft').style.left='-280px';
})

//previous button
document.querySelector('#prev').addEventListener('click',()=>{
    let index=songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`)[1]);
    if(index-1>=0){
        playBtn.getElementsByTagName('img')[0].src='./images/pause2.svg'
        songName.innerText=decodeURIComponent(songs[index-1]).replace('.mp3','').replace(/\s\(\d+\)|\s-\sCopy/g, '').trim().replaceAll('-',' ');
        songTime.innerText='00:00/00:00'
        playMusic(songs[index-1]);
    }
})

// next button
document.querySelector('#next').addEventListener('click',()=>{
    let index=songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`)[1]);
    if(index+1<songs.length){
        playBtn.getElementsByTagName('img')[0].src='./images/pause2.svg'
        songName.innerText=decodeURIComponent(songs[index+1]).replace('.mp3','').replace(/\s\(\d+\)|\s-\sCopy/g, '').trim().replaceAll('-',' ');
        songTime.innerText='00:00/00:00'
        playMusic(songs[index+1]);
    }
})

document.querySelector('#volumerange').addEventListener('change',(e)=>{
    let v=e.target.value;
    currentSong.volume=(v/100);
})

document.getElementById('volumeButton').addEventListener('click',(e)=>{
    if(currentSong.volume>0){
        e.target.src="./images/mute.svg";
        currentSong.volume=0;
        document.getElementById('volumerange').value=0;
    }
    else if(currentSong.volume==0){
        e.target.src="./images/volume_up_24dp_5F6368_FILL0_wght400_GRAD0_opsz24.svg";
        currentSong.volume=0.1;
        document.getElementById('volumerange').value=10;
    }
})

// add listener to playbar
document.getElementsByClassName('line')[0].addEventListener('click',(e)=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.getElementsByClassName('circle')[0].style.left=percent+'%';
    currentSong.currentTime=(currentSong.duration*percent)/100;
})