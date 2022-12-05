const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const uri = "mongodb+srv://mx648:ait2022@aitfinal.p5pkw.mongodb.net/final";



const User = new mongoose.Schema({
  // username, password
  username:{type:String},
  password:{type:String},
  information:  {type: mongoose.Schema.Types.ObjectId, ref: 'Info'},
  group:{type: mongoose.Schema.Types.ObjectId, ref: 'Group'},
  monthlyTime:{type:Number,required:true,default:0}
});

const Info = new mongoose.Schema({
	// user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
	date:{type:String,required:true},
	month:{type:Number,required:true},
	dailyStudy:{type:Number,default:0},
	dailySleep:{type:Number,default:0},
	dailyLeisure:{type:Number,default:0},
	monthlyStudy:{type:Number,default:0},
	monthlySleep:{type:Number,default:0},
	monthlyLeisure:{type:Number,default:0},
	groupID: {type: String},
}, {
	_id: true
});

const Group = new mongoose.Schema({
	createdAt:{type:String,required:true},
	groupID:{type:String,required:true},
	member:[{type:String}],
	avgStudy:{type:Number,default:0},
	avgSleep:{type:Number,default:0},
	avgLeisure:{type:Number,default:0}
});

const List = new mongoose.Schema({
  groups:[{type:String}],
  listID:{type:String,required:true}
});


User.plugin(passportLocalMongoose);
// List.plugin(URLSlugs('name'));

mongoose.model('User', User);
mongoose.model('Info', Info);
mongoose.model('Group', Group);
mongoose.model('List',List);

const mongooseOpts = {
	useNewUrlParser: true,  
	useUnifiedTopology: true
  };

mongoose.connect(uri, mongooseOpts, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log('connected to database'); 
	}
  });
  
