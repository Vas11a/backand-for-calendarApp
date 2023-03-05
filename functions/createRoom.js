
// function which create room

const createRoom = (name, password) => {
	let i = 0;
	let readyDays = [];
	while (i < 7) {
		const data = new Date();
		const nextData = new Date(data.getTime() + ((24 * (i))*60*60*1000));
		readyDays.push({data: `${nextData.getDate() > 9 ? nextData.getDate() : '0'+nextData.getDate()}/${nextData.getMonth()+1 >9 ? nextData.getMonth()+1 : '0'+(nextData.getMonth()+1)}`, messages: {}});
		i++;
	};
	const newRoom = {
		name,
		password,
		days: readyDays
	};
	return newRoom;
};

export default createRoom;