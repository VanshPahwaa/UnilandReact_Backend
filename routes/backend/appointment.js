const mongoose=require("mongoose")
const express=require("express")
const ExcelJS = require('exceljs');


const Appointment=require("../../model/appointments.js")

const router = express.Router();



// Customer Data


router.get('/customerData/download-excel', async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Appointments');

  // Add header row
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Preferred Date', key: 'preferredDate', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
  ];

    let filter={}
        if(req.query.fromDate){
            filter={...filter,preferredDate:{$gte:req.query.fromDate}}
        }
        if(req.query.toDate){
           filter={...filter,preferredDate:{$lte:req.query.toDate}}
        }
        
  const appointments = await Appointment.find(filter).lean();
  appointments.forEach(app => {
    worksheet.addRow({
      name: app.clientName,
      preferredDate: app.preferredDate.toISOString().split('T')[0],
      status: app.status
    });
  });

  res.setHeader('Content-Disposition', 'attachment; filename="appointments.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res);
  res.end();
});



module.exports = router;
