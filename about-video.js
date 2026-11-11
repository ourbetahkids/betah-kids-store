import { supabase } from './db.js';

// ABOUT HERO VIDEO: reads slot "about_video" from table site_media and, if there is one,
// replaces the picture in the About top banner (#aboutVideoBlock) with the video.
// If there is no video, the original picture stays.
const SLOT = 'about_video';

function addStyles() {
  if (document.getElementById('bk-about-video-style')) return;
  const css = [
    '#aboutVideoBlock.abv-on{flex:0 0 auto;max-width:100%;}',
    '#aboutVideoBlock.abv-tall{width:min(340px,100%);}',
    '#aboutVideoBlock.abv-wide{width:min(560px,100%);}',
    '@media (min-width:901px){#aboutVideoBlock.abv-tall{width:min(320px,100%);}#aboutVideoBlock.abv-wide{width:min(520px,100%);}}',
    '#aboutVideoBlock .abv-frame{position:relative;width:100%;aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:#000;box-shadow:0 14px 36px rgba(0,0,0,.2);}',
    '#aboutVideoBlock .abv-frame video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;display:block;background:#000;border-radius:0;box-shadow:none;max-height:none;}',
    '#aboutVideoBlock .abv-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;padding:0 0 0 5px;border:0;border-radius:50%;background:#FF6A00;color:#fff;font-size:1.6rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(255,106,0,.45);}',
    '#aboutVideoBlock .abv-play:hover{background:#E56510;}',
    '#aboutVideoBlock .abv-frame.abv-playing .abv-play{display:none;}'
  ].join('\n');
  const st = document.createElement('style');
  st.id = 'bk-about-video-style';
  st.textContent = css;
  document.head.appendChild(st);
}

async function init() {
  const holder = document.getElementById('aboutVideoBlock');
  if (!holder) return;

  let url = '';
  try {
    const { data, error } = await supabase.from('site_media').select('media_url').eq('slot', SLOT).maybeSingle();
    if (error) throw error;
    url = data && data.media_url ? String(data.media_url) : '';
  } catch (err) {
    console.error('About video not loaded:', err);
    return;
  }
  if (!/^https:\/\//i.test(url)) return;

  addStyles();
  holder.innerHTML = '<div class="abv-frame"></div>';
  holder.classList.add('abv-on', 'abv-tall');

  const frame = holder.querySelector('.abv-frame');
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.setAttribute('playsinline', '');
  video.src = url + '#t=0.001';
  frame.appendChild(video);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'abv-play';
  btn.setAttribute('aria-label', 'Play video with sound');
  btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  frame.appendChild(btn);

  video.addEventListener('loadedmetadata', function () {
    if (video.videoWidth && video.videoHeight) {
      const wide = video.videoWidth >= video.videoHeight;
      frame.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
      holder.classList.toggle('abv-wide', wide);
      holder.classList.toggle('abv-tall', !wide);
    }
  });

  btn.addEventListener('click', function () {
    video.muted = false;
    video.controls = true;
    frame.classList.add('abv-playing');
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function (e) {
        console.warn('Video could not start:', e);
        frame.classList.remove('abv-playing');
      });
    }
  });

  video.addEventListener('ended', function () {
    video.currentTime = 0;
    video.controls = false;
    frame.classList.remove('abv-playing');
  });
}

init();
