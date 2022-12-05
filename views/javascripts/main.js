document.addEventListener('DOMContentLoaded', main);
const mongoose = require('mongoose');
const { UserExistsError } = require('passport-local-mongoose/lib/errors');
const Info = mongoose.model('Info');
const User = mongoose.model('User');

function main(){
    const submitBtn = document.querySelector(".submitBtn");
    submitBtn.addEventListener('click',submitData);
    const reminder = document.querySelector(".wrongFormat");
    reminder.style.display = "none";
}
function submitData(){
    const study = document.querySelector('.study');
    const sleep = document.querySelector('.sleep');
    const leisure = document.querySelector('.leisure');
    if ((isNaN(Number(study.value)) && isNaN(study.value)===false) || (isNaN(Number(sleep.value)) && isNaN(sleep.value)===false) || (isNaN(Number(leisure.value)) && isNaN(leisure.value)===false)){
        document.getElementById("newStudyForm").reset();
        document.getElementById("newSleepForm").reset();
        document.getElementById("newLeisureForm").reset();
        const reminder1 = document.querySelector(".wrongFormat");
        reminder1.study.display = "block";
    }
    else{
        const {study,sleep,leisure} = req.body;
	const time = new Date();
	const month = time.getMonth()+1
	if (req.user.information){
		console.log("find!!!");
		Info.findOne({_id:req.user.information},function(err,info,count){
			// console.log(info);
			if(study){
				info.dailyStudy+=Number(study);
			}
			if (sleep){
				info.dailySleep+=Number(sleep);
			}
			if(leisure){
				info.dailyLeisure+=Number(leisure);
			}
			info.save(function(err,saved){
				console.log('saved new info!!!')
			})
		})
		res.redirect('/user');
	}
	else{
		let full = '';
		full +=time.getFullYear()+"-"+month+'-'+time.getDate();
		const newInfo = new Info({
		date:full,
		month:month,
		dailyStudy:study,
		dailySleep:sleep,
		dailyLeisure:leisure,
	});
	console.log(newInfo);

	newInfo.save(function(err,saveReview){
		console.log("saved your info!!!")
	});
	User.findOne({username:req.user.username},function(err,u,count){
		u.information=newInfo._id;
		u.save(function(err,saved,count){
			console.log('saved info ref!!!');
		});
		res.redirect('/user');
	});

	}


    }

}