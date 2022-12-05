const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Info = mongoose.model('Info');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const helper = require('../helper');


router.get('/record', (req, res) => {
	res.render('record',{});
	// res.sendFile(__dirname+'/record.html');

});

router.post('/record', (req, res) => {
	const userCreateTime = Object.create(helper.constructTime);
	const {study,sleep,leisure} = req.body;
	const time = new Date();
	const month = time.getMonth()+1;
	const recordDate = userCreateTime.full();
	if ((study!=='' && isNaN(Number(study))) || (sleep!=='' && isNaN(Number(sleep))) || (leisure!=='' && isNaN(Number(leisure)))){
		res.render('record',{message:"Wrong input Format😢"});
	}
	else if (req.user.information){
			console.log("find!!!");
			Info.findOne({_id:req.user.information},function(err,info,count){
				// console.log(info);
				if (recordDate!==info.date){
					info.date = recordDate;
					info.dailyLeisure=0;
					info.dailySleep=0;
					info.dailyStudy=0;
				}
				if (month!==info.month){
					info.month = month;
					info.monthlyStudy = 0;
					info.monthlySleep = 0;
					info.monthlyLeisure = 0;

				}
				if(study){
					info.dailyStudy+=Number(study);
					info.monthlyStudy+=Number(study);
				}
				if (sleep){
					info.dailySleep+=Number(sleep);
					info.monthlySleep+=Number(sleep);
				}
				if(leisure){
					info.dailyLeisure+=Number(leisure);
					info.monthlyLeisure+=Number(leisure);
				}
				info.save(function(err,saved){
					console.log('saved new info!!!');
				});
				User.findOne({username:req.user.username},function(err,u,count){
					u.monthlyTime = info.monthlyStudy+info.monthlySleep+info.monthlyLeisure;
					u.save(function(err,saved,count){
						console.log('saved info ref!!!');
					});
				});
			});
			res.redirect('/user');
		}
		else{
			// let full = '';
			// full +=time.getFullYear()+"-"+month+'-'+time.getDate();
			const full = userCreateTime.full();
			const newInfo = new Info({
			date:full,
			month:month,
			dailyStudy:study,
			dailySleep:sleep,
			dailyLeisure:leisure,
			monthlyStudy:study,
			monthlySleep:sleep,
			monthlyLeisure:leisure
			
		});
		console.log(newInfo);
	
		newInfo.save(function(err,saveReview){
			console.log("saved your info!!!");
		});
		User.findOne({username:req.user.username},function(err,u,count){
			u.monthlyTime = newInfo.monthlyStudy+newInfo.monthlySleep+newInfo.monthlyLeisure;
			u.information=newInfo._id;
			u.save(function(err,saved,count){
				console.log('saved info ref!!!');
			});
			res.redirect('/user');
		});
	
		}
	
	

	// if(req.session.recordID === req.session.id){
	// 	req.session.mine.push(newReview);
	// }
	// else{
	// 	req.session.recordID = req.session.id;
	// 	req.session.mine = [newReview];
	// }


});

router.get('/report', (req, res) => {
	const userCreateTime = Object.create(helper.constructTime);
	const now = userCreateTime.full();
	const time = new Date();
	const month = time.getMonth()+1;

	User.findOne({username:req.user.username}, function(err,u){
		if (u){
			Info.findOne({_id:u.information}, function(err,info){
				if (info){
					console.log(info);
					if (now!==info.date){
						info.date = now;
						info.dailyStudy=0;
						info.dailySleep=0;
						info.dailyLeisure=0;
					}
					if (month!==info.month){
						info.monthlyStudy=0;
						info.monthlySleep=0;
						info.monthlyLeisure=0;
					}
					info.save(function(err,saved){
						console.log("saving successfuly!!!");
					});
					res.render("report",{studyTime:info.dailyStudy,sleepTime:info.dailySleep,leisureTime:info.dailyLeisure, t1:info.monthlyStudy, t2:info.monthlySleep, t3:info.monthlyLeisure,flag:true});
				}
				else{
					res.render('report',{message:"You haven't recorded anything yet😢"});
				}
				
			});
		}
		else{
			res.render('report',{message:"You haven't recorded anything yet😢"});
		}
	});
	// res.render('report');
	
});

router.post('/report',(req,res)=>{
	User.findOne({username:req.user.username}, function(err,u){
		if (u){
			const i = u.information;
			Info.findOne({_id:i}, function(err,info){
				if (req.body.time==="dStudy"){
					info.monthlyStudy=info.monthlyStudy-info.dailyStudy+Number(req.body.data);
					info.dailyStudy=Number(req.body.data);
				}
				else if (req.body.time==="dSleep"){
					info.monthlySleep=info.monthlySleep-info.dailySleep+Number(req.body.data);
					info.dailySleep=Number(req.body.data);
				}
				else if (req.body.time==="dLeisure"){
					info.monthlyLeisure=info.monthlyLeisure-info.dailyLeisure+Number(req.body.data);
					info.dailyLeisure=Number(req.body.data);
				}
				else{
					info.monthlyStudy=info.monthlyStudy-info.dailyStudy+Number(req.body.data);
					info.dailyStudy=Number(req.body.data);

				}

				info.save(function(err,saved){
					console.log("saving successfuly!!!");
				});
				u.monthlyTime=info.monthlyStudy+info.monthlyLeisure+info.monthlySleep;
				u.save(function(err,saved){
					console.log("User saving successfuly!!!");
				});
				res.render("report",{studyTime:info.dailyStudy,sleepTime:info.dailySleep,leisureTime:info.dailyLeisure, t1:info.monthlyStudy, t2:info.monthlySleep, t3:info.monthlyLeisure});
			});
		}
		else{
			res.render('report',{message:"You haven't recorded anything yet😢"});
		}
	});
});

router.get('/groupReport',(req,res)=>{
	User.findOne({username:req.user.username}, function(err,u){
		if (u){
			if (u.group && u.group!==null){
				Group.findOne({_id:u.group},function(err,g){
					const data = g.member.map((e,i)=>{
						const index = i+1;
						return index+" "+e;
					});
					res.render('groupReport',{data:data, name:g.groupID});
					
				});
			}
			else{
				res.render('groupReport',{message:"You have NOT joined any group😢"});
			}
		}

	});

	// User.findOne({username:req.user.username}, function(err,u){
	// 	if(u){
	// 		if(u.group && u.group!==null){
	// 			let remaining = null;
	// 			Group.findOne({_id:u.group},function(err,g){
	// 				if(err){
	// 					throw err;
	// 				}
	// 				else{
	// 					let totStudy = 0;
	// 					let totSleep = 0;
	// 					let totLeisure = 0;
	// 					if(g.member && g.member.length>0){
	// 						console.log(findUser('mx648'));
							
	// 						let avg= g.avgLeisure+g.avgSleep+g.avgStudy;
	// 						remaining = g.member.filter((e)=>{
	// 							User.findOne({username:e},function(err,u){
	// 								Info.findOne({_id:u.information},function(err,i){
	// 									if (i){
	// 										if (i.monthlyStudy+i.monthlyLeisure+i.monthlySleep>=avg){
	// 											return e;
	// 										}
					
	// 									}
	// 								});
	// 							});


	// 						});
	// 					console.log("!!!!!!");
	// 					console.log(g.avgStudy, g.avgSleep, g.avgLeisure);
	// 					if (remaining.includes(req.username)){
	// 						res.render('groupReport',{avgStudy:g.avgStudy,avgSleep:g.avgSleep, avgLeisure:g.avgLeisure, group:g.groupID, m1:"You TOT. recorded time is above the average. 🥳"});
	// 					}
	// 					else{
	// 						res.render('groupReport',{avgStudy:g.avgStudy,avgSleep:g.avgSleep, avgLeisure:g.avgLeisure, group:g.groupID, m1:"You TOT. recorded time is below the average. 😢"});
	// 					}
							
	// 					}
						

						

						


	// 				}
	// 			});

	// 		}
	// 		else{
	// 			res.render('groupReport',{message:"You have NOT joined any group yet!!!"});

	// 		}

	// 	}
	// 	else{
	// 		res.render('groupReport',{message:"You have NOT joined any group yet!!!"});
	// 	}

	// });

});

module.exports = router;
