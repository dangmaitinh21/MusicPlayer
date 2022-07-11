const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";
const player = $(".player");
const heading = $(".dashboard__song-title");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const btnPlay = $(".btn-toggle-play");
const progress = $("#progress");
const btnNext = $(".btn-next");
const btnPrev = $(".btn-prev");
const btnRandom = $(".btn-random");
const btnRepeat = $(".btn-repeat");
const playlist = $(".playlist");
const time = $(".time-progress");
const nowPlaying = $(".dashboard__playing");
const songList = 
[
    {
      title: "Yêu đương khó quá thì chạy về khóc với anh",
      image: "./images/ydkqcvkva.jpg",
      source: "./songs/ydkqcvkva.mp3",
      singer: "ERIK",
    },
    {
      title: "Sea Shanty",
      image: "./images/ss.jpg",
      source: "./songs/ss.mp3",
      singer: "Home Free",
    },
    {
      title: "Em đã xa anh",
      image: "./images/edxa.jpg",
      source: "./songs/edxa.mp3",
      singer: "Như Việt",
    },
    {
      title: "Nhân gian trên giấy",
      image: "./images/ngtg.png",
      source: "./songs/ngtg.mp3",
      singer: "Từ Viễn Thư",
    },
    {
      title: "Luv u 300.000 km",
      image: "./images/lu30vkms.png",
      source: "./songs/lu30vkms.mp3",
      singer: "Drum7 (Cukak Remix)",
    },
]


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: songList,
  render() {
    if(this.songs.length != 0) {
        nowPlaying.textContent = "Now playing:";
        const htmls = this.songs.map((song, index) => {
        return `
                <div class="song ${
                index === this.currentIndex ? "active" : ""
                }" data-index="${index}">
                    <div class="thumb" style="background-image: url('${
                    song.image
                    }')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.title}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                `;
        });
        playlist.innerHTML = htmls.join("");
    }
  },
  handleEvents() {
    const cdWidth = cd.offsetWidth;
    const _this = this;
    const cdAnimation = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );
    cdAnimation.pause();

    document.onscroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    btnPlay.onclick = () => {
      if (_this.isPlaying) {
        audio.pause();
        cdAnimation.pause();
      } else {
        if(_this.songs.length != 0) {
            audio.play();
            cdAnimation.play();
        } 
      }
    };

    audio.onplay = () => {
      _this.isPlaying = true;
      player.classList.add("playing");
    };

    audio.onpause = () => {
      _this.isPlaying = false;
      player.classList.remove("playing");
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setInterval(function() {
            let timeRemaining = audio.duration - audio.currentTime;
            let minutes = Math.floor(timeRemaining/60);
            let seconds = Math.floor(timeRemaining%60);
            let secondsWithLeadingZero = seconds < 10 ? '0' + seconds : seconds;
            let minutesWithLeadingZero = minutes < 10 ? '0' + minutes : minutes
            time.textContent = `${minutesWithLeadingZero} : ${secondsWithLeadingZero}`
        }, 500)
        progress.value = Math.floor((audio.currentTime * 100) / audio.duration);
      }
    };

    progress.onchange = (e) => {
      audio.currentTime = (e.target.value * audio.duration) / 100;
    };

    btnNext.onclick = () => {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    btnPrev.onclick = () => {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    btnRandom.onclick = () => {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      btnRandom.classList.toggle("active", _this.isRandom);
    };

    btnRepeat.onclick = () => {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      btnRepeat.classList.toggle("active", _this.isRepeat);
    };

    audio.onended = () => {
      if (this.isRepeat) {
        audio.play();
      } else {
        btnNext.click();
      }
    };

    playlist.onclick = (e) => {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },
  defineProperties() {
    Object.defineProperty(this, "currentSong", {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },
  loadCurrentSong() {
    if(this.songs.length != 0) {
        heading.textContent = this.currentSong.title;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.source;
    }
  },
  nextSong() {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong() {
    $(".song.active").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  },
  loadConfig() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  start() {
    this.loadConfig();
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    btnRepeat.classList.toggle("active", this.isRepeat);
    btnRandom.classList.toggle("active", this.isRandom);
  },
};
app.start();
