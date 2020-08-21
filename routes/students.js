var express = require('express');
var router = express.Router();
const fs = require('fs')
const {checkToken} = require('./../middlewares/index');


var path='Data/Students.json'

router.get('/', (req, res)=>{
    let students = JSON.parse(fs.readFileSync(path));
    res.send({
        "Students Details": students
    })
})

router.get('/:id', (req, res)=>{
    let students = JSON.parse(fs.readFileSync(path));
    let curr_student;
    students.forEach(student =>{
        if(student.id == req.params.id){
            curr_student = student;
            return res.json({
                "student": curr_student,
                "error": null
            });
        }
    });
});

//------POST STUDENTS API------//

router.post('/', (req,res)=>{
    let students = JSON.parse(fs.readFileSync(path));
    const student = req.body;
    if (student.name){
        students.push({
            ...student,
            id: students.length + 1
        });
        fs.writeFileSync(path, JSON.stringify(students, null, 2))
        res.send("Student registered successfully")
    }else{
        res.send("Invalid Student Creation!!")
    }
});

router.delete('/', checkToken, (req, res)=>{
    var students = JSON.parse(fs.readFileSync(path));
    let curr_student;
    students.forEach(student =>{
        if (student.name === req.body.name){
            curr_student = student
        }
    })
    students.splice(students.indexOf(curr_student),1)
    fs.writeFileSync(path, JSON.stringify(students, null, 2))
    res.send('Student Deleted Successfully')
})

module.exports = router;