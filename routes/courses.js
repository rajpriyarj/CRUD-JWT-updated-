const express = require('express');
const router = express.Router();
const fs = require('fs')
const {checkToken} = require('./../middlewares/index');

var path='Data/Courses.json';
var studentPath = 'Data/Students.json';

router.get('/', (req,res)=>{
    var courses = JSON.parse(fs.readFileSync(path))
    res.send({
        "data": courses
    })
})

router.get('/:id', (req,res)=>{
    var courses = JSON.parse(fs.readFileSync(path))
    let curr_course
    let param=req.params
    courses.forEach(course=>{
        if (course.id==param.id){
            curr_course=course
        }
    })
    res.send(curr_course)
})

router.post('/', (req,res)=>{
    var courses = JSON.parse(fs.readFileSync(path));
    course = req.body;
    if(course.name && course.description && course.enrolledStudents && course.availableSlots) {
        courses.push({
            ...course,
            id: courses.length + 1
        });
        fs.writeFileSync(path, JSON.stringify(courses, null, 2))
        res.send("Course Added Successfully!");
    }
})

router.post('/:id/enroll', checkToken, (req,res)=>{
    const courseId = req.params.id;
    const studentId= req.body.id;
    const studentName = req.body.name;
    let courses = JSON.parse(fs.readFileSync(path));
    let students = JSON.parse(fs.readFileSync(studentPath));
    let curr_course;
    let curr_student;
    students.forEach(student =>{
        if(student.id == studentId){
            curr_student = 1
            courses.forEach(course=>{
                if (course.id==courseId){
                    curr_course=1
                    const student_index = course["enrolledStudents"].findIndex(i => i.id === studentId);
                    if (student_index > -1) {
                        res.send('Student already enrolled in this course!')
                    }else{
                        if (course["availableSlots"]>0){
                            course["availableSlots"]-=1
                            course["enrolledStudents"].push({
                                "id": studentId,
                                "name": studentName
                            })
                            res.send('Student enrolled successfully')
                            fs.writeFileSync(path, JSON.stringify(courses, null, 2))
                        }else{
                            res.send('No slots available for this course!')
                        }
                    }
                }
            })
            if (!curr_course){
                res.send('No course found for this id!')
            }
        }
    })
    if (!curr_student){
        res.send('No student found for this id!')
    }


});

router.put('/:id/deregister', checkToken, (req,res)=>{
    const courseId = req.params.id;
    const studentId= req.body.id;
    const studentName = req.body.name;
    let courses = JSON.parse(fs.readFileSync(path));
    let students = JSON.parse(fs.readFileSync(studentPath));
    let curr_course;
    let curr_student;
    students.forEach(student =>{
        if (student.id == studentId){
            curr_student = 1
            courses.forEach(course=>{
                if (course.id==courseId){
                    curr_course=1
                    //const student_index = course["enrolledStudents"].indexOf(studentId)
                    const student_index = course["enrolledStudents"].findIndex(i => i.id === studentId);
                    if (student_index !== -1){
                        course["enrolledStudents"].splice(student_index,1)
                        course["availableSlots"] += 1
                        fs.writeFileSync(path, JSON.stringify(courses, null, 2))
                        res.send('Student unregistered successfully')
                    }else{
                        res.send('No student with this id is enrolled in this course!')
                    }
                }
            })
            if (!curr_course){
                res.send('No course found for this id!')
            }
        }
    })
    if (!curr_student){
        res.send('No student found for this id!')
    }

});


module.exports = router;