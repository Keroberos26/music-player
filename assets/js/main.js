/**
 * Render songs
 * Scroll top
 * Play / pause / seek
 * CD rotate
 * Next / prev
 * Random
 * Next / Repeat when ended
 * Active song
 * Scroll active song into view
 * Play song when click
 */
const PLAYER_STORAGE_KEY = 'KERO_PLAYER';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const volumeBtn = $('.btn-volume');
const playlist = $('.playlist');
const volume = $('#volume');

const formatTime = function (seconds) {
  // Chuyển tổng số giây thành phút và giây
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Thêm số 0 đằng trước nếu cần thiết
  remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

  // Kết hợp thành định dạng "mm:ss"
  return minutes + ':' + remainingSeconds;
};

const app = {
  currentIndex: 0,
  volume: 1,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isMute: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: 'Nevada',
      singer: 'Vicetone',
      path: './assets/music/nevada.mp3',
      image: './assets/img/nevada.jpg',
    },
    {
      name: 'Señorita',
      singer: 'Shawn Mendes, Camila Cabello',
      path: './assets/music/senorita.mp3',
      image: './assets/img/senorita.jpg',
    },
    {
      name: 'Summertime',
      singer: 'Cinnamons x Evening Cinema',
      path: './assets/music/summertime.mp3',
      image: './assets/img/summertime.jpg',
    },
    {
      name: 'Unity',
      singer: 'TheFatRat',
      path: './assets/music/unity.mp3',
      image: './assets/img/unity.jpg',
    },
    {
      name: 'GODS',
      singer: 'NewJeans',
      path: './assets/music/gods.mp3',
      image: './assets/img/gods.jpg',
    },
    {
      name: 'Monster',
      singer: 'Katie Sky',
      path: './assets/music/monster.mp3',
      image: './assets/img/monster.jpg',
    },
    {
      name: 'RISE',
      singer: 'The Glitch Mob, Mako, and The Word Alive',
      path: './assets/music/rise.mp3',
      image: './assets/img/rise.jpg',
    },
    {
      name: 'Wicked Wonderland',
      singer: 'The Glitch Mob, Mako, and The Word Alive',
      path: './assets/music/wicked-wonderland.mp3',
      image: './assets/img/wicked-wonderland.jpg',
    },
  ],
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.width();

    const cdAnimation = cdThumb[0].animate(
      [
        {
          transform: 'rotate(360deg)',
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      },
    );
    cdAnimation.pause();

    $(document).scroll(function () {
      const newWidth = cdWidth - $(this).scrollTop();
      cd.css({ width: newWidth, opacity: newWidth / cdWidth });
    });

    playBtn.click(function () {
      _this.isPlaying ? audio[0].pause() : audio[0].play();
    });

    audio.on('play', function () {
      player.addClass('playing');
      cdAnimation.play();
      _this.isPlaying = true;
    });

    audio.on('pause', function () {
      player.removeClass('playing');
      cdAnimation.pause();
      _this.isPlaying = false;
    });

    audio.on('timeupdate', function () {
      const progressPercent = Math.floor((this.currentTime / this.duration) * 100);
      progress.val(progressPercent);
      $('.time .current').text(formatTime(audio[0].currentTime));
    });

    audio.on('ended', function () {
      if (_this.isRepeat) {
        audio[0].play();
      } else {
        nextBtn.click();
      }
    });

    audio.on('loadedmetadata', function () {
      $('.time .duration').text(formatTime(audio[0].duration));
    });

    progress.on('input', function () {
      const time = ($(this).val() * audio[0].duration) / 100;
      audio[0].currentTime = time;
    });

    prevBtn.click(function () {
      if (audio[0].currentTime < 5) {
        if (_this.isRandom) {
          _this.randomSong();
        } else {
          _this.prevSong();
        }
        audio[0].play();
      } else {
        audio[0].currentTime = 0;
      }
      _this.render();
    });

    nextBtn.click(function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio[0].play();
      _this.render();
    });

    randomBtn.click(function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      $(this).toggleClass('active', _this.isRandom);
    });

    repeatBtn.click(function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      $(this).toggleClass('active', _this.isRepeat);
    });

    playlist.click(function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      const optionNode = e.target.closest('.option');
      if (songNode) {
        _this.currentIndex = +songNode.dataset.index;
        _this.loadCurrentSong();
        _this.render();
        audio[0].play();
      }
      if (optionNode) {
      }
    });

    volumeBtn.on('click', function () {
      if (window.innerWidth > 768) {
        _this.isMute = !_this.isMute;
        volumeBtn.toggleClass('mute', _this.isMute);
        volume.val(_this.currentVolume * 100);
        _this.setConfig('isMute', _this.isMute);
        audio[0].volume = _this.currentVolume;
      }
    });

    volume.on('input', function () {
      _this.volume = $(this).val() / 100;
      _this.setConfig('volume', _this.volume);
      audio[0].volume = _this.currentVolume;
      // Bug click vào kéo
      if (_this.volume === 0) {
        volumeBtn.addClass('mute');
      } else {
        volumeBtn.removeClass('mute');
      }
    });
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
    Object.defineProperty(this, 'currentVolume', {
      get: function () {
        return this.isMute ? 0 : this.volume;
      },
    });
  },
  render: function () {
    const songList = this.songs.map((song, index) => {
      return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
      <div class="thumb" style="background-image: url('${song.image}')">
      </div>
      <div class="body">
        <h3 class="title">${song.name}</h3>
        <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>`;
    });
    playlist.html(songList);
    const songActive = $('.song.active');
    setTimeout(() => {
      $('html, body').animate(
        {
          scrollTop: songActive.offset().top + songActive.outerHeight(true) - $(window).height(),
        },
        300,
      );
    }, 100);
  },
  loadCurrentSong: function () {
    heading.text(this.currentSong.name);
    cdThumb.css({ backgroundImage: `url(${this.currentSong.image})` });
    audio.attr('src', this.currentSong.path);
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.isMute = this.config.isMute;
    this.volume = this.config.volume;
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = this.songs.length - 1;
    this.loadCurrentSong();
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) this.currentIndex = 0;
    this.loadCurrentSong();
  },
  randomSong: function () {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.songs.length);
    } while (randomIndex === this.currentIndex);
    this.currentIndex = randomIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán config local trong máy
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lý sự kiện DOM event
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên
    this.loadCurrentSong();

    // Render playlist
    this.render();

    audio[0].volume = this.currentVolume;
    volume.val(this.currentVolume * 100);
    randomBtn.toggleClass('active', this.isRandom);
    repeatBtn.toggleClass('active', this.isRepeat);
    volumeBtn.toggleClass('mute', this.isMute);
  },
};

app.start();
