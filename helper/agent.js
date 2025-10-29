const User=require("../model/user")
const paginate=require("../utils/paginate")

async function getAllAgents(filters={},option={},projection=null,populate=null){
    return paginate(User,filters,option,projection,["agentSpecificDetails.leads","agentSpecificDetails.propertyUploaded","agentSpecificDetails.location"]);
}

module.exports=getAllAgents