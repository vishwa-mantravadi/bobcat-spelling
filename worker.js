importScripts('https://unpkg.com/dexie/dist/dexie.js');
const db = new Dexie('spellingbee'); 
db.version(14).stores({ words: '++id, cat' });
db.on("populate", async (tx) => {
	response = await fetch("./words.json")
	let jsonObj = await response.json()
	let data = []
	jsonObj.forEach(function (item) {
		mp3 = atob(item["mp3"])
		const arr = new Uint8Array(mp3.length)
		for(let i=0;i<arr.length;i++)
		{
			arr[i] = mp3.charCodeAt(i)
		}
		const blob = new Blob([arr], {type: 'audio/mp3'})
		item["mp3"] = blob				
		data.push(item)
	})	
	await db.words.bulkAdd(data)
});

self.addEventListener('message', async function(e) { 
	let action = e.data["action"]
	switch(action)
	{
		case "install":
			this.postMessage(["event", "installing"])
			await db.open()
			this.postMessage(["event", "ready"])
			break;
		case "query":
			const keys = await db.words.where('cat').equals(e.data["cat"]).primaryKeys()
			this.postMessage(["data", keys])
			break;
		case "play":
			const entry = await db.words.where('id').equals(e.data["id"]).first()
			this.postMessage(["answer", entry])
			break;				
	}
})