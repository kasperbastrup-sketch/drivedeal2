export type LeadStatus = 'cold' | 'warm' | 'sent' | 'booked' | 'replied'

export interface Lead {
  id: number
  name: string
  email: string
  phone: string
  car: string
  days: number
  source: string
  status: LeadStatus
  score: number
}

export const leadsData: Lead[] = [
  {id:1,name:"Carlos Mendez",email:"carlos.m@gmail.com",phone:"+34 612 001 001",car:"BMW 520d",days:127,source:"HubSpot",status:"cold",score:82},
  {id:2,name:"María González",email:"mgonzalez@hotmail.com",phone:"+34 612 002 002",car:"Mercedes GLC 300",days:94,source:"Web form",status:"warm",score:71},
  {id:3,name:"Antonio Ruiz",email:"a.ruiz@empresa.es",phone:"+34 612 003 003",car:"Audi A4 S-line",days:201,source:"HubSpot",status:"cold",score:55},
  {id:4,name:"Sofia Hernández",email:"sofia.h@gmail.com",phone:"+34 612 004 004",car:"Volvo XC60",days:45,source:"Showroom",status:"sent",score:68},
  {id:5,name:"Javier López",email:"jlopez@work.com",phone:"+34 612 005 005",car:"Tesla Model 3",days:312,source:"HubSpot",status:"cold",score:44},
  {id:6,name:"Elena Martín",email:"elena.m@yahoo.es",phone:"+34 612 006 006",car:"BMW X5 xDrive",days:18,source:"Calendly",status:"booked",score:94},
  {id:7,name:"Pablo Sánchez",email:"pablo.s@gmail.com",phone:"+34 612 007 007",car:"Mercedes E 220d",days:88,source:"Web form",status:"warm",score:76},
  {id:8,name:"Laura Fernández",email:"l.fernandez@icloud.com",phone:"+34 612 008 008",car:"Porsche Cayenne",days:156,source:"HubSpot",status:"sent",score:61},
  {id:9,name:"Diego Torres",email:"diego.t@gmail.com",phone:"+34 612 009 009",car:"Mercedes GLE 400",days:67,source:"Web form",status:"replied",score:88},
  {id:10,name:"Ana Jiménez",email:"ana.j@empresa.es",phone:"+34 612 010 010",car:"Audi Q7",days:230,source:"HubSpot",status:"cold",score:39},
  {id:11,name:"Roberto Vargas",email:"r.vargas@gmail.com",phone:"+34 612 011 011",car:"BMW 330i",days:105,source:"HubSpot",status:"cold",score:66},
  {id:12,name:"Carmen Delgado",email:"carmen.d@outlook.com",phone:"+34 612 012 012",car:"Tesla Model Y",days:52,source:"Web form",status:"warm",score:73},
]
