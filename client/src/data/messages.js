import {faker} from '@faker-js/faker'

function generateFakeImages(count) {
    return Array.from({ length: count }, () => ({
      url: faker.image.url({category: 'buildings'}),// Generates a random image URL
      alt: faker.lorem.words(3), // Generates a random alt text
    }));
  }
  

const fakeImages = generateFakeImages(10); // Generate 10 fake images
const fakeImages2 = generateFakeImages(5); // Generate 5 fake images

const MessageHistory = [
    {type : 'separator', date:"21 January 2025"},
    {type : 'text', timestamp:"14:37", content:"Hey Brutha! How are you doing?", incoming:true},
    {type : 'text', timestamp:"19:30", content:"Hey! I'm doing great, thanks for asking", incoming:false, read_receipt:"read"},
    {type : 'text', timestamp:"19:31", content:"How about you?", incoming:false, read_receipt:"delivered"},
    {type : 'separator', date:"22 January 2025"},
    {type : 'media', timestamp:"14:37", assets:[fakeImages[0]], incoming:true, caption:"Have a look at this"},
    {type : 'media', timestamp:"14:39", assets:[fakeImages2[0], fakeImages[1]], incoming:true},
    {type : 'separator', date:"Today"},
    {type : 'media', timestamp:"15:32", assets:[fakeImages2[3], fakeImages[3], fakeImages[2]], incoming:false, read_receipt:"sent", caption:"Please check them out"},
    {type : 'media', timestamp:"19:37", assets:fakeImages2, incoming:true},
    {type : 'reply', timestamp:"19:38", original:"How about you?", content:"I'm doing great too, thanks for asking", incoming:true},
    {type : 'reply', timestamp:"19:39", original:"I'm doing great too, thanks for asking", content:"That's great to hear!", incoming:false, read_receipt:"read"},
    {type : 'text', timestamp:"19:40", content:"https://www.youtube.com/watch?v=4K4OmnNxhe0&list=PLdLUE-L26MMbXYkddCi6Cb1jy5dKczosk&index=5", incoming:false, read_receipt:"delivered"},
 ]

    export default MessageHistory;