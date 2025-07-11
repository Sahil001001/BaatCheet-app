import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const  signup = async(req,res)=>{
    const {fullName,password,email,profilePic} = req.body;
    try{
        if (!fullName || !email || !password){
            return res.status(400).json({message : "All fields are required !"});
        }
        if(password.length <6){
            return res.status(400).json({message: 'Password must be atleast of 6 characters'});
        }
        const user = await User.findOne({email});

        if (user){
            return res.status(400).json({message: "User already exists."})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName :fullName,
            email : email,
            password : hashedPass,
            profilePic : profilePic || "",
        })

        if (newUser) {
            generateToken(newUser.id,res);
            await newUser.save();

            res.status(201).json({
                _id : newUser.id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic,
                createdAt: newUser.createdAt,

        });
    }

        else{
             res.status(400).json({message : "Invalid user data!"})
        }

    }catch(err){
        res.status(500).json({message : "Internal server error"})
    }

  
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,  
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const logout = (req,res)=>{
   try{
    res.cookie("jwt","",{maxAge : 0 });
    res.status(200).json({message : "Logged out successfully"});

   }catch(err){
    res.status(500).json({message : "Internal server error"});

   }
}

export const updateProfile = async (req,res) =>{
    try{

    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic){
        return res.send(400).json({message : "Profile pic required!"})
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {profilePic : uploadResponse.secure_url} ,
        {new : true} 
    )

    res.status(200).json(updatedUser);

  } catch(err){
    res.send(500).json({message : "Internal server error"})

}
}
export const checkAuth = (req,res) =>{
    try{
        res.status(200).json(req.user);
    }catch(err){
        res.status(500).json({message : "Internal error occured"});
    }

}