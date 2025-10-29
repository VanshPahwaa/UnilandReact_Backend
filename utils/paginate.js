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






// module.exports=async function paginate(Model, query, page = 1, limit = 10, sort = { createdAt: -1 }) {
//   try {
//     console.log(limit,page)
//     // Calculate skips
//     const skip = (page - 1) * limit;

//     // Run queries in parallel
//     const [results, totalCount] = await Promise.all([
//       Model.find(query).sort(sort).skip(skip).limit(limit),
//       Model.countDocuments(query)
//     ]);


//     return {
//       success: true,
//       results,
//       pagination: {
//         totalDocs: totalCount,
//         totalPages: Math.ceil(totalCount / limit),
//         currentPage: page,
//         pageSize: limit,
//         hasNextPage: page < Math.ceil(totalCount / limit),
//         hasPrevPage: page > 1
//       }
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message
//     };
//   }
// }

