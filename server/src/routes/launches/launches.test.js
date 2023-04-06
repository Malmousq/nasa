const request = require('supertest');
const app = require('../../app');
const {mongoConnect, mongoDisconnet} = require('../../services/mongo')

describe('Test API', ()=>{

    beforeAll( async ()=>{
        await mongoConnect();
    });

    afterAll(async ()=>{
        await mongoDisconnet();
    })

    describe('Test GET/launches', () => {
        test('It should response with 202',async () => { 
            const response = await request(app).get('/v1/launches')
            .expect(200)
            .expect('Content-Type', /json/);
        })
        
    });
    
    describe('Test POST/launch', () => {
    
        const jeuDeTest =  {
            mission: "Super Gruik  Gruik!",
            rocket: "ZTM exp IS1",
            launchDate: "june 17, 2024",
            target: "Kepler-1652 b"
        }
    
        const jeuDeTestSansDate = {
            mission: "Super Gruik  Gruik!",
            rocket: "ZTM exp IS1",
            target: "Kepler-1652 b"
        }
    
        const jeuDeTestErr =  {
            mission: "Super Gruik  Gruik!",
            rocket: "ZTM exp IS1",
            launchDate: "gruik",
            target: "Kepler-1652 b"
        }
    
        test('should be 201 created', async () => { 
            const response = await request(app).post('/v1/launches')
            .send(jeuDeTest)
                .expect(201)
                .expect('Content-Type', /json/);
    
                const requestDate = new Date(jeuDeTest.launchDate).valueOf();
                const responseDate = new Date(response.body.launchDate).valueOf();
            expect(requestDate).toBe(responseDate);
            expect(response.body).toMatchObject(jeuDeTestSansDate)
         });
    
    test('It should catch missing requiered poperties', async () => {
        const response = await request(app).post('/v1/launches')
        .send(jeuDeTestSansDate)
            .expect(400)
            .expect('Content-Type', /json/);
    
        expect(response.body).toStrictEqual({
            error: "Missing required launch property"
        })
    });
    
    test('It should catch invalid date', async () => {
        const response = await request(app).post('/v1/launches')
        .send(jeuDeTestErr)
            .expect(400)
            .expect('Content-Type', /json/);
    
        expect(response.body).toStrictEqual({
            error : "Invalid launch date"
        })
        
    });   
     });


});



