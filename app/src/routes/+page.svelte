<script lang="ts">
	import { cashflows } from '$lib/stores/cashflow';
	import { derived } from 'svelte/store';

	const today = new Date().toISOString().slice(0, 10);

	const totals = derived(cashflows, ($flows) => {
		let todayNet = 0;
		let weekNet = 0;

		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 6);
		const weekStartStr = weekStart.toISOString().slice(0, 10);

		for (const f of $flows) {
			const sign = f.type === 'income' ? 1 : -1;
			if (f.day === today) todayNet += sign * f.amount;
			if (f.day >= weekStartStr) weekNet += sign * f.amount;
		}
		return { todayNet, weekNet };
	});
</script>

<h1>Mon Cahier d’Entreprise</h1>

<div class="tiles">
	<div class="tile">
		<h2>Aujourd’hui</h2>
		<p>€{$totals.todayNet / 100}</p>
	</div>
	<div class="tile">
		<h2>Cette semaine</h2>
		<p>€{$totals.weekNet / 100}</p>
	</div>
</div>

<button class="add-btn" on:click={() => (location.href = '/add')}>＋ Ajouter</button>

<style>
	.tiles {
		display: flex;
		gap: 1rem;
	}
	.tile {
		flex: 1;
		background: #f1f1f1;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
	}
	.add-btn {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		font-size: 2rem;
		border: none;
		background: #2196f3;
		color: #fff;
		border-radius: 50%;
		width: 56px;
		height: 56px;
	}
</style>
