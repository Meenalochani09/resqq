module.exports=(req,res)=>res.json({ok:true,ai:!!process.env.ANTHROPIC_API_KEY,time:new Date().toISOString()});
