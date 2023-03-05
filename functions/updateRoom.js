// function update days 

const updateDays = (daysArr) => {
	let newDaysArr = [];
	daysArr.forEach((elem,idx) => {
		let dayData;
		const todayData = new Date();
		const nextData = new Date(todayData.getTime() + ((24 * (idx))*60*60*1000));
		dayData = `${nextData.getDate() > 9 ? nextData.getDate() : '0'+nextData.getDate()}/${nextData.getMonth()+1 >9 ? nextData.getMonth()+1 : '0'+(nextData.getMonth()+1)}`;
		let dayFull = {data: dayData, messages:{}};
		for (var i = daysArr.length - 1; i >= 0; i--) {
			if (daysArr[i].data === dayData) {
				dayFull.messages = daysArr[i].messages;
			};
		};
		newDaysArr.push(dayFull);
	});
	return newDaysArr;
};

export default updateDays;