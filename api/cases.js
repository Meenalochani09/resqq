// Prototype endpoint. Serverless memory is not persistent: swap for Supabase (see README).
const SEED=[['RQ-2041',92,'rescue','Velachery','Suggested'],['RQ-2038',85,'medical','Tambaram','Suggested'],['RQ-2044',78,'rescue','Ennore','New'],['RQ-2030',66,'shelter','Adyar','Assigned'],['RQ-2047',58,'water','Perungudi','New'],['RQ-2049',49,'food','Mylapore','New'],['RQ-2022',35,'food','Adyar','Suggested'],['RQ-2051',22,'shelter','Mylapore','New']];
module.exports=(req,res)=>{
  if(req.method==='GET') return res.json(SEED.map(([id,score,type,loc,status])=>({id,score,type,loc,status})));
  if(req.method==='PATCH'){const b=req.body||{};if(!b.id||!b.status)return res.status(400).json({error:'id and status required'});return res.json({ok:true,id:b.id,status:b.status,persisted:false});}
  res.status(405).json({error:'GET or PATCH'});
};
