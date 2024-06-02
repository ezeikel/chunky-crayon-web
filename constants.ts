export const CREATE_COLORING_PAGE_PROMPT_PRE_PROMPT = `Create a detailed JSON prompt suitable for DALL-E 3 to generate a simple line drawing image for a coloring book. The image should depict a kid-friendly scene inspired by the following description: '`;

const COPYRIGHTED_CHARACTER_DESCRIPTION = `". If the description includes a copyrighted name like Spiderman, then describe Spiderman's physical appearance in detail instead. Describe his costume, his spider logo, his web shooters, his mask, his eyes, his muscles, his webbing etc. Specify that this must be in black and white only and simplify any complex details so that the image remains simple and avoids any complicated shapes or patterns. Update the original description replacing the copyrighted character name with this detailed description of the character. If the description does not include any copyrighted characters, then please ignore this step`;

// export const CREATE_COLORING_PAGE_PROMPT_POST_PROMPT = `${COPYRIGTHED_CHARACTER_DESCRIPTION}. The generated image should depict the scene described and should not include any random colored shapes, borders, or coloring pencils. Build an appropriate scene for the image based on the description provided, creating characters for the scene if mentioned. Do not duplicate any characters if not specifically asked to do so. Do not draw any borders around characters or elements in the image unless specifically asked to do so. Ensure the image is a simple line drawing. Make sure not to include any color or fill in shapes; the image should be black and white only. Replace any colored lines with black. When creating the image, focus on simplicity and clarity as the image is aimed at young children aged 3-8. The lines should be thick and clear, with no shading, no gradients, and no solid fill areas. If no background for the scene was specified, create a relevant one based on the subject of the scene, but do not add any extra elements to the scene apart from the background. Avoid adding any borders or elements that are not part of the main scene. The style should be cartoon-like, avoiding fine detail lines and complex patterns. High contrast and clear distinctions between elements are key. No shape should have a fill or shading.`;

export const CREATE_COLORING_PAGE_POST_PROMPT = `
  ${COPYRIGHTED_CHARACTER_DESCRIPTION}.

  Build an appropriate scene for the image based on the description provided, creating characters for the scene if mentioned.

  These are the rules for the image (please follow them strictly):
  1. The image should be a simple line drawing suitable for a children’s coloring book.
  2. No color at all. The image must be black and white only. Absolutely no colors should be used in any part of the image, including eyes, tongues, shoes, and accessories.
  3. No textures, patterns, or gradients. Keep it simple.
  4. Do not duplicate any characters or elements unless specifically asked to do so.
  5. Do not draw any borders around characters or elements unless specifically asked to do so.
  6. The image must be suitable for children aged 3-8. Avoid complexity and inappropriate elements, including naked bodies.
  7. Do not include any shadows, shading, or gradients.
  8. Ensure the lines are thick and clear, with no shading, solid fill areas, or fuzzy textures.
  9. If no background is specified, create a relevant one but do not add extra elements.
  10. Avoid adding any borders or elements not part of the main scene.
  11. Any clothing or accessories should follow the same style: line drawing, thick lines, no shading or complex shapes, and no fill.
  12. Do not depict any shades of skin color or fuzzy textures like fur or hair. All skin and hair should be drawn with simple lines only, with no color or shading.
  13. Draw hair or fur as simple lines without texture or complex patterns.
  14. The style should be cartoon-like, avoiding fine detail lines and complex patterns.
  15. Ensure high contrast and clear distinctions between elements.
  16. The image should only use black and white, with no intermediate colors. No shape should have any fill or shading.
  17. Do not fill any shapes; use lines only.
  18. All elements, including accessories such as shoelaces, eyes, tongues, shoes, and any other part of the image, must be in black and white only, with no color or shading.
  19. Use large, simple shapes for all elements in the image, including background elements. Avoid small details and fine lines.
  20. Ensure that all characters and elements have a friendly and approachable appearance suitable for children aged 3-8. Avoid any scary or menacing features.
  21. All clothing or accessories should not have any fuzzy textures; use simple lines only.
  22. The entire image must be composed of large, simple shapes, and must be easy to color within for young children.
  23. Avoid any complex or intricate elements, especially in the background. Buildings and other structures should be drawn with large, simple shapes and minimal detail.
  24. Do not include any random elements, objects, or duplications that are not part of the main scene description.
  25. Ensure that there is no color used anywhere in the image. Reiterate that the image must be black and white only with no colored elements.
`;

export const REFERENCE_IMAGES = [
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/birthdays-8uiLmIVecHAw1yjqNRQ2OCYHoaa8gW.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/dinosaur-bfmBtp1o0kVeIZtuVVNhmKTMJXOgS7.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/family-and-friends-g4vlGFNcWXrcHQ7sB4y8LLYiO3PIAG.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/farm-animals-knAdbOJKhulPhb7xnaCkMXycTunbNi.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/sea-creatures-njuJrigKzRhyl7GZXeigWSHtbPFgiG.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/superheroes-zX4vpC6SMlXVEn1Wxombkyr2fU165K.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/trains-TOkt3DJ3Oy56ZTV0uy7h2XmD8DsTGV.webp',
  'https://x0odfckl5uaoyscm.public.blob.vercel-storage.com/reference-images/unicorns-8XVTm2dwIgIAUpah12vBMnWz7A02yo.webp',
];

export const MAX_ATTEMPTS = 3;

export const COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#000000',
  '#FFFFFF',
];
