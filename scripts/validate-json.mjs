import fs from 'fs';
import path from 'path';

const p = path.join(process.cwd(), 'public', 'data', 'items.json');
try{
  const raw = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(raw);
  if(!Array.isArray(data)) throw new Error('Root is not an array');
  let ok = true; let i = 0;
  for(const it of data){
    i++;
    const miss = ['id','type','title','artist_or_director','year','genres','moods','poster_url','play_url']
      .filter(k=>!(k in it));
    if(miss.length){
      ok = false; console.error(`Item #${i} missing keys:`, miss.join(','));
    }
  }
  if(ok){
    console.log('✅ items.json looks good. Total items:', data.length);
    process.exit(0);
  } else {
    console.error('❌ items.json has problems. See messages above.');
    process.exit(1);
  }
}catch(e){
  console.error('❌ Failed to read/parse public/data/items.json:', e.message);
  process.exit(1);
}
