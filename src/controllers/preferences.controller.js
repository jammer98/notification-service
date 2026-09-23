import * as preferenceService from "../services/perfernce.service.js";

export async function getPreferences(req,res){
    const preferences = await preferenceService.getPreferneceMatrix(req.user.id);
    res.status(200).json({ preferences })
}

export async function upsertPreferences(req,res){
    const preference = await preferenceService.upsertPreference(req.user.id, req.body);
    res.status(200).json({ preference });
}