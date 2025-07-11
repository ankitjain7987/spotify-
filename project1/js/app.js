let currentSong = new Audio("");
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00.00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  // console.log(as)

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // console.log(songs)

  



  // show all the songs in the playlist

  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> 
                             
         <img class="invert " src="https://img.icons8.com/?size=100&id=aanJRSdBR4ug&format=png&color=000000" alt="">
        <div class="info">
         <div>${song.replaceAll("%20", " ")}</div>
         <div>Ankit</div>
         </div>
        <div class="playnow">
       <span>Play Now</span>
        <img class="invert " src="https://img.icons8.com/?size=100&id=59756&format=png&color=000000" alt="">
        </div></li>`;
  }

  // attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    // console.log(e.querySelector('.info').firstElementChild.innerHTML)
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (tracker, pause = false) => {
  currentSong.src = `/${currfolder}/` + tracker;
  if (!pause) {
    currentSong.play();
  }
  play.src = "img/pause.png";
  document.querySelector(".songinfo").innerHTML = decodeURI(tracker);
  document.querySelector(".songtime").innerHTML = "00.00 / 00.00";
};

async function displayAlbum() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/songs")&& !e.href.includes(".htaccess") ) {
      let folder = e.href.split("/").slice(-1)[0];

      // console.log("Fetching folder:", folder);
      // console.log(e.href.split("/").slice(-1)[0]);

      // get the metadata of all the songs in the folder
      let a = await fetch(`/songs/${folder}/info.json`);

      let response = await a.json();
      // console.log("fetching responce",response);

      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card"><div class="play">
                            <svg width="24" height="24" viewBox="0 0 64 64" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="32" fill="#1DB954" />
                                <polygon points="26,20 26,44 46,32" fill="white" />
                            </svg>
                        </div>

                        <img src="songs/${folder}/cover.jpg"
                            alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  });


  cardContainer.addEventListener("click", async (e) => {
  const card = e.target.closest(".card");
  if (card) {
    const folder = card.dataset.folder;
    songs = await getSongs(`songs/${folder}`);
    // play music click playlist
    playMusic(songs[0])
  }
});


}

async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // display all the album on the page

  displayAlbum();

  // attach an event listener to play next previous button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.png";
    } else {
      currentSong.pause();
      play.src = "img/play.png";
    }
   
  });

  // timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  // add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  // add  an event listener for hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add  an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-240%";
  });
  // add an event listener to  previous  button

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // add anevent to volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume-off.png" , "volume-level.png")
      }
    });
// add an event listener ot mute the track
document.querySelector(".volume>img").addEventListener("click",e=>{
  // console.log(e.target)
  if(e.target.src.includes("volume-level.png")){
    e.target.src = e.target.src.replace("volume-level.png","volume-off.png")
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  }else{
    e.target.src = e.target.src.replace("volume-off.png" , "volume-level.png")
    currentSong.volume = .40;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
  }
});
}
main();
