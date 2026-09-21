import { registerUser, loginUser, getUserById } from "../services/auth.service.js";


export async function register(req,res){
    const { user, token } = await registerUser(req.boody);
    res.status(201).json({ user, token });
}

export async function login(req,res){
    const { user, token } = await loginUser(req.body);
    res.status(200).json({ user, token});
}

export async function me(req, res) {
  const user = await getUserById(req.user.id);
  res.status(200).json({ user });
}