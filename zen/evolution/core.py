from conf import popsize
from .utils import log_stuff


def algorithm(toolbox, stats, history, hof):
    # Create initial Population and evaluate it
    population = [toolbox.individual() for _ in range(popsize)]
    evaluate(population, toolbox)
    log_stuff(0, history, hof, population, stats, toolbox)
    # Commence evolution
    for g in range(1, 1000 + 1):
        survivors = toolbox.select(population)

        offspring = toolbox.breed(survivors)
        mutants = toolbox.mutate(offspring + survivors)
        evaluate(offspring + mutants + survivors, toolbox)
        population[:] = offspring + mutants + survivors

        log_stuff(g, history, hof, population, stats, toolbox)

    return hof


def evaluate(population, toolbox):
    invalid_ind = [ind for ind in population if not ind.fitness.valid]
    fitnesses = toolbox.map(toolbox.evaluate, invalid_ind)
    for ind, fit in zip(invalid_ind, fitnesses):
        ind.fitness.values = fit[0]
        ind.cmdline = fit[1]
