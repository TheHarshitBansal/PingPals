import { faker } from "@faker-js/faker";

const users = [];
function getUsers(){
  for (let i = 0; i < 20; i++) {
    users.push({
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      message: faker.commerce.productDescription(),
      time: `${faker.number.int({ min: 0o0, max: 23 })}:${faker.number.int({
        min: 0o0,
        max: 59,
      })}`,
      badge: faker.number.int({ min: 0, max: 10 }),
    });
  }

return users;
}

getUsers();

export default users;