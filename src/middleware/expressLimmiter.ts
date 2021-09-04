import RateLimit from 'express-rate-limit'

const ExpressLimmiter = RateLimit({
	// jeda block ip address
	windowMs: 10*60*1000, // 10 menit
	max: 500, // maksimal banyak request 500 per 10 menit, lebih dari itu blokir ip address selama 10 menit
	message: "You have made too many requests to this page, please wait a moment"
});

export default ExpressLimmiter