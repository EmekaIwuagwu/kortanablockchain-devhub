"""
Master Test Runner - Runs all blockchain fixes tests
"""

import subprocess
import sys

def run_test(script_name, description):
    """Run a test script and return result"""
    print("\n" + "=" * 80)
    print(f"Running: {description}")
    print("=" * 80)
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=False,
            text=True
        )
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run {script_name}: {e}")
        return False

def main():
    print("KORTANA BLOCKCHAIN - COMPREHENSIVE FIX TESTING")
    print("=" * 80)
    print("\nThis will test all three critical fixes:")
    print("  1. Transaction Inflow/Outflow Indexing")
    print("  2. Smart Contract Deployment")
    print("  3. Database Clearing (Manual test)")
    print()
    
    results = {}
    
    # Test 1: Transaction Indexing
    results['indexing'] = run_test(
        'scripts/test_transaction_indexing.py',
        'Fix #1: Transaction Inflow/Outflow'
    )
    
    # Test 2: Contract Deployment  
    results['contracts'] = run_test(
        'scripts/test_contract_deployment.py',
        'Fix #2: Smart Contract Deployment'
    )
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\n[PASS] Transaction Indexing: {'PASS' if results.get('indexing') else 'FAIL'}")
    print(f"[PASS] Contract Deployment: {'PASS' if results.get('contracts') else 'FAIL'}")
    print(f"[NOTE] Database Clearing: MANUAL TEST REQUIRED")
    
    print(f"\nResults: {passed}/{total} automated tests passed")
    
    if passed == total:
        print("\nALL AUTOMATED TESTS PASSED!")
        print("The blockchain fixes are working correctly.")
    else:
        print("\nSOME TESTS FAILED")
        print("Please review the output above for details.")
    
    print("\n" + "=" * 80)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
