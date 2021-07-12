import sql from 'mssql';

const dbSettings = {
    user: 'gabrielrosaless',
    password: '123456',
    server: 'localhost',
    database: 'ECOMMERCE',
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

// como connect es asincrona uso un await
export async function getConnection(){
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.log(error);
    }    
}


export {sql};

