const constructTime = {
    full(){
        let date="";
        const time = new Date();
        const month = time.getMonth()+1;
        date +=time.getFullYear()+"-"+month+'-'+time.getDate();
        return date
    }
}
module.exports={
    constructTime:constructTime
}