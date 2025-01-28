import {faker} from '@faker-js/faker'

function generateFakeImages(count) {
    return Array.from({ length: count }, () => ({
      url: faker.image.url({category: 'buildings'}),// Generates a random image URL
      alt: faker.lorem.words(3), // Generates a random alt text
    }));
  }
  

const fakeImages = generateFakeImages(10); // Generate 10 fake images
const fakeImages2 = generateFakeImages(5); // Generate 5 fake images
export const fakeImagesMedia = generateFakeImages(50); // Generate 3 fake images
const linkMessages = Array.from({ length: 10 }, () => ({
  link: faker.internet.url(),
}))

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
    {type : 'text', timestamp:"19:41", content:"I'll check it out later", incoming:true},
    {type: 'document', timestamp:"19:42", fileName:"Document.pdf", fileSize:"1.2 MB", content:"Please find the document attached", incoming:false, read_receipt:"sent"},
    {type: 'document', timestamp:"19:43", fileName:"Document.pdf", fileSize:"1.2 MB", content:"Please find the document attached", incoming:true},
 ]

    export default MessageHistory;


export const StarredMessages = [
    {type : 'text', content:"Hey! I'm doing great, thanks for asking", incoming:false, read_receipt:"read"},
    {type : 'media', assets:[fakeImages2[3], fakeImages[3], fakeImages[2]], incoming:false, read_receipt:"sent", caption:"Please check them out"},
    {type : 'reply', original:"I'm doing great too, thanks for asking", content:"That's great to hear!", incoming:false, read_receipt:"read"},
    {type: 'document', fileName:"Document.pdf", fileSize:"1.2 MB", content:"Please find the document attached", incoming:true},
]

export const LinkPreviews = [
    {type: 'text' , timestamp:"19:30", content:linkMessages[0].link, incoming:false, read_receipt:"read"},
    {type: 'text' , timestamp:"19:30", content:linkMessages[1].link, incoming:true},
    {type: 'text' , timestamp:"19:30", content:linkMessages[2].link, incoming:true},
    {type: 'text' , timestamp:"19:30", content:linkMessages[3].link, incoming:false, read_receipt:"read"},
    {type: 'text' , timestamp:"19:30", content:linkMessages[4].link, incoming:true},
]

export const docsPreview = Array.from({ length: 20 }, (_, index) => ({
  type: 'document',
  timestamp: `${faker.number.int({ min: 0o0, max: 23 })}:${faker.number.int({
        min: 0o0,
        max: 59,
      })}`,
  fileName: `Document${index + 1}.pdf`,
  fileSize: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
  content: "Please find the document attached",
  incoming: Math.random() < 0.5,
}));