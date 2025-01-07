import sys

n = int(sys.stdin.readline())
unit = list(map(int, sys.stdin.readline().rstrip().split()))
k = int(sys.stdin.readline())
recipe = [[] for _ in range(n)]

for _ in range(k):
    tmp = list(map(lambda x: int(x) - 1, sys.stdin.readline().rstrip().split()))
    recipe[tmp[0]] += tmp[2:]


def check(metal, cnt):
    if units[metal] >= cnt:
        units[metal] -= cnt
        return True

    if not recipe[metal]:
        return False

    need = cnt - units[metal]

    for ingredient in recipe[metal]:
        if not check(ingredient, need):
            return False

    units[metal] = 0
    return True


lo = 0
hi = 10000000

while lo + 1 < hi:
    mid = (lo + hi) // 2
    units = unit[:]
    if check(n - 1, mid):
        lo = mid
    else:
        hi = mid

print(lo)
