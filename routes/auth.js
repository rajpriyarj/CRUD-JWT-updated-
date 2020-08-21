const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt  = require('bcrypt');
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');

const path='Data/Auth.json'

const passwordHash = async (password) => {
    const saltRounds = 12;
    const [err, passwordHash] = await to(bcrypt.hash(password, saltRounds));
    if (err) {
        logger.error('Error while generating password hash', { error: err });
        throw Error('Error while generating password hash');
    }
    return passwordHash;
};

let salt = 'ZGV2c25lc3QK';

const generateToken  = (userData) => {
    let token = jwt.sign(userData, salt, {
        expiresIn: 172800000,
    });
    return token;
};

const validateSignup = (email, username, password) =>{
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!email || !username || !password){
        return false;
    }else if(email.match(mailformat)){
        return true;
    }else{
        return false;
    }
}

router.post('/signup', async (req, res)=>{
    let students = JSON.parse(fs.readFileSync(path));
    let {email, username, password} = req.body;
    if (!validateSignup(email, username, password)){
        res.send('Required missing fields');
    }else{
        let user = {
            email: email,
            username: username,
            password: await passwordHash(password)
        };
        students.push(user)
        fs.writeFileSync(path, JSON.stringify(students, null, 2))
        return res.json({
            data: {
                isSignedUp: true,
                username
            },
            error: null
        });
    }
});


router.post('/login', async (req, res)=>{
    let users = JSON.parse(fs.readFileSync(path));
    let {email, password} = req.body;
    let user_found = users.find(user => user.email === email);

    if (!user_found){
        return res.json({
            data: {
                data: null,
                error: 'invalid email'
            }
        });
    }

    if (user_found){
        const [err, isValid] = await to(bcrypt.compare(password, users[0].password));
        //console.log(password)
        //console.log(users[0].password)
        if (isValid){
            return res.json({
                data: {
                    token: generateToken(user_found)
                },
                error: null
            })
        } else{
            return res.json({
                data: null,
                error: 'invalid password'
            })
        }
    }

});

module.exports = router;