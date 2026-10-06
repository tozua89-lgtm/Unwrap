import re

with open('C:\\Users\\tozua\\.gemini\\antigravity\\scratch\\unwrap-demo\\marketplace.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"let myVault = CARD_DB\.filter.*?<img src=\"\+c\.img\+\" style=\"max-height:100%;max-width:100%;object-fit:contain\">\s*</div>"

replacement = '''  let myVault = CARD_DB.filter(c => c.owner === \\'me\\');
  try {
    const pulled = JSON.parse(localStorage.getItem(\\'unwrap_pulled_cards\\') || \\'[]\\');
    myVault = [...pulled, ...myVault];
  } catch(e) {}
  
  if(myVault.length === 0) {
    grid.innerHTML = <div style="grid-column:1/-1;text-align:center;padding:1rem">Non hai carte nel Vault da offrire.</div>;
  } else {
    grid.innerHTML = myVault.map(c => 
      <div class="card-item swap-selectable" id="swapMyCard-" style="cursor:pointer;border:2px solid transparent;transition:all 0.2s" onclick="selectMyCardForSwap('')">
        <div style="aspect-ratio:5/7;background:;padding:4px;display:flex;align-items:center;justify-content:center">
          <img src="" style="max-height:100%;max-width:100%;object-fit:contain">
        </div>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('C:\\Users\\tozua\\.gemini\\antigravity\\scratch\\unwrap-demo\\marketplace.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
