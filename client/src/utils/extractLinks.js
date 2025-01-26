const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linksArray = [];
  
    const modifiedString = text.replace(urlRegex, (url) => {
      const urlObject = new URL(url);
      const domain = urlObject.hostname;
      linksArray.push(url);
      return `<span class="underline"><a href="${url}" target="_blank">${domain}</a></span>`;
    });
  
    return { modifiedString, linksArray };
  };
  
  export default extractLinks;
  