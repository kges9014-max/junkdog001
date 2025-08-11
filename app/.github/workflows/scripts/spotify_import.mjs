// 讀 public/data/playlists.txt，抓整份歌單 → 單曲，並去重
import fs from 'fs';
import path from 'path';

const CID = process.env.SPOTIFY_CLIENT_ID;
const CSECRET = process.env.SPOTIFY_CLIENT_SECRET;
if(!CID || !CSECRET){ console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET'); process.exit(1); }

async function getToken(){
  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(CID+':'+CSECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
  if(!res.ok) throw new Error('token failed');
  return (await res.json()).access_token;
}

function parseId(url){ const m = url.match(/playlist\/([a-zA-Z0-9]+)/); return m ? m[1] : null; }

async function fetchAllTracks(playlistId, token){
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&offset=0`;
  const items = [];
  while(url){
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if(!res.ok){ throw new Error(await res.text()); }
    const data = await res.json();
    items.push(...(data.items||[]));
    url = data.next;
  }
  return items.map(x=>x.track).filter(Boolean);
}

function mapTrack(t){
  const artists = (t.artists||[]).map(a=>a.name).join(', ');
  const img = (t.album?.images||[])[0]?.url || '';
  const year = (t.album?.release_date||'').slice(0,4);
  return {
    id: `sp-${t.id}`, type: 'track', title: t.name,
    artist_or_director: artists, year: year? Number(year): undefined,
    genres: ['spotify'], moods: ['mixed'],
    poster_url: img, play_url: t.external_urls?.spotify || ''
  };
}

async function main(){
  const txtPath = path.join(process.cwd(), 'public', 'data', 'playlists.txt');
  if(!fs.existsSync(txtPath)) { console.error('public/data/playlists.txt not found'); process.exit(1); }
  const urls = fs.readFileSync(txtPath, 'utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const ids = urls.map(parseId).filter(Boolean);
  const token = await getToken();

  const seen = new Set(); const out = [];
  for(const id of ids){
    const tracks = await fetchAllTracks(id, token);
    for(const t of tracks){
      if(!t?.id) continue;
      const mapped = mapTrack(t);
      if(!seen.has(mapped.id)){ seen.add(mapped.id); out.push(mapped); }
    }
  }
  const outPath = path.join(process.cwd(), 'public', 'data', 'items.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote', out.length, 'unique tracks to', outPath);
}
main().catch(e=>{ console.error(e); process.exit(1); });
