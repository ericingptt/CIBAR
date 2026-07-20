const CACHE_NAME='cibar-cache-v20260720-5';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  e.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    try{
      const res=await fetch(req,{cache:'no-store'});
      if(res.ok)cache.put(req,res.clone());
      return res;
    }catch(err){
      const cached=await cache.match(req);
      if(cached)return cached;
      throw err;
    }
  }));
});
