const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

UserSchema.method({
    // Función que encripta un password 10 veces y lo retorna
    async encryptPassword(password){
        // Aplicamos un hash 10 veces
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        return hash;
    },

    // Función que toma la contraseña y la compara contra la que esta en la base de datos
    async matchPassword(password){
        return await bcrypt.compare(password, this.password);
    }
})

module.exports = mongoose.model('Usuario', UserSchema);