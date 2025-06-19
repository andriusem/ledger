<script lang="ts">
  import { cashflows } from '$lib/stores/cashflow';
  import type { CashFlow } from '$lib/db';
  import { goto } from '$app/navigation';

  const TYPES: CashFlow['type'][] = ['expense', 'income'];
  const CATEGORY_MAP: Record<CashFlow['type'], string[]> = {
    expense: ['Carburant', 'Ingrédients', 'Fournitures', 'Transport', 'Autre'],
    income: ['Ventes', 'Prestations', 'Autre']
  };

  let type: CashFlow['type'] = 'expense';
  let category = CATEGORY_MAP[type][0];
  let amountText = '';
  let note = '';

  // keep category list in sync when type changes
  $: if (!CATEGORY_MAP[type].includes(category)) {
    category = CATEGORY_MAP[type][0];
  }

  const appendDigit = (d: string) => {
    amountText += d;
  };
  const backspace = () => {
    amountText = amountText.slice(0, -1);
  };
  const clear = () => (amountText = '');

  const save = async () => {
    if (!amountText) return alert('Montant ?');
    const amountCents = parseInt(amountText, 10) * 100; // whole euros for simplicity
    const day = new Date().toISOString().slice(0, 10);
    await cashflows.add({
      type,
      amount: amountCents,
      category,
      note,
      day,
      createdAt: Date.now()
    });
    alert('✅ Bien noté !');
    goto('/');
  };
</script>

<h1>Nouvelle ligne</h1>

<section>
  <label>Type</label>
  <select bind:value={type}>
    {#each TYPES as t}
      <option value={t}>{t === 'income' ? 'Revenu' : 'Dépense'}</option>
    {/each}
  </select>
</section>

<section>
  <label>Catégorie</label>
  <select bind:value={category}>
    {#each CATEGORY_MAP[type] as c}
      <option>{c}</option>
    {/each}
  </select>
</section>

<section>
  <label>Montant (€)</label>
  <div class="keypad">
    <input readonly value={amountText} placeholder="0" />
    <div class="keys">
      {#each [1,2,3,4,5,6,7,8,9] as k}
        <button on:click={() => appendDigit(k.toString())}>{k}</button>
      {/each}
      <button on:click={clear}>C</button>
      <button on:click={() => appendDigit('0')}>0</button>
      <button on:click={backspace}>⌫</button>
    </div>
  </div>
</section>

<section>
  <label>Note (facultatif)</label>
  <textarea rows="2" bind:value={note} placeholder="Remarque…"></textarea>
</section>

<button class="save" on:click={save}>Enregistrer</button>

<style>
  section {
    margin-bottom: 1rem;
  }
  .keypad {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .keypad input {
    font-size: 2rem;
    text-align: right;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .keys button {
    font-size: 1.5rem;
    padding: 0.75rem;
  }
  .save {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
    background: #2196f3;
    color: #fff;
    border: none;
    border-radius: 4px;
  }
</style>
