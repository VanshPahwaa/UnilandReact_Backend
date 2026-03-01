const {limitHelper,pageHelper}=require("../utils/data")


async function paginate(model, filters = {}, options = {}, projection = null,populate=null) {
  const page = options.page || pageHelper;
  const limit = options.limit || limitHelper;
  const skip = (page - 1) * limit;

  // const total = await model.countDocuments(filters);
  let dbQuery= model.find(filters, projection)
    .skip(skip)
    .limit(limit)
    .sort(options.sort || { createdAt: -1 });

  if(populate){
    if(Array.isArray(populate)){
      populate.forEach(p=>{
        dbQuery=dbQuery.populate(p);
      })
    }else{
      dbQuery=dbQuery.populate(populate)
    }
  }

  const [results,total]=await Promise.all([
    dbQuery.exec(),
    model.countDocuments(filters)
  ])

  return {
    results,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
      limit:limit
    },
  };
}

module.exports = paginate;
